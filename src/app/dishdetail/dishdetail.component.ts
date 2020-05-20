import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dishIds: string[];
  dish: Dish;
  prev: string;
  next: string;
  @ViewChild('cform') commentFormDirective;
  commentForm: FormGroup;
  

  commentsTitle: String = "Comments";

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject("BaseURL") public BaseURL) { 
        this.createForm();
    }

  ngOnInit() {
    this.route.params
        .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
        .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id)});
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    
  }

  goBack(): void {
    this.location.back();
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

    createForm() {
        this.commentForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2)] ],
            rating: 5,
            comment: ''
        });
        this.commentForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        
        this.onValueChanged(); // (re)set validation messages now
    }

    onSubmit() {
        this.dish.comments.push({
            rating: this.commentForm.get("rating").value,
            comment: this.commentForm.get("comment").value,
            author: this.commentForm.get("author").value,
            date: (new Date()).toISOString()
        });
        this.commentForm.reset({
            author: '',
            rating: 5,
            comment: ''
        });
        this.commentFormDirective.resetForm({
            author: '',
            rating: 5,
            comment: ''
        });
    }

    formErrors = {
        'author': '',
        'comment': ''
    };

    validationMessages = {
        'author': {
            'required':      'Author Name is required.',
            'minlength':     'Author Name must be at least 2 characters long.'
        },
        'comment': {
            'required':      'Comment is required.'
        }
    };

    onValueChanged(data?: any) {
        if (!this.commentForm) { return; }
        const form = this.commentForm;
        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }

}
