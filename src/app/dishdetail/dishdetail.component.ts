import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/Comment';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { switchMap } from 'rxjs/operators';

import { trigger, state, style, animate, transition } from '@angular/animations'

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0.5
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {

  dishIds: string[];
  dish: Dish;
  dishCopy: Dish;
  prev: string;
  next: string;
  errMess: string;
  comment: Comment;
  @ViewChild('cform') commentFormDirective;
  commentForm: FormGroup;
  commentsTitle: String = "Comments";
  visibility: string = "shown";

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject("BaseURL") public BaseURL) { 
        this.createForm();
    }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
        .pipe(switchMap((params: Params) => {this.visibility = "hidden"; console.log(this.visibility); return this.dishservice.getDish(params['id']);}))
        .subscribe(dish => {this.dish = dish; this.dishCopy = dish; this.setPrevNext(dish.id); this.visibility = "shown";console.log(this.visibility);},
                    errMess => this.errMess = <any>errMess);
    
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
        this.comment = this.commentForm.value;
        this.comment.date = (new Date()).toISOString();
        this.dishCopy.comments.push(this.comment);
        this.dishservice.putDish(this.dishCopy)
            .subscribe(
                dish => {
                    this.dish = dish;
                    this.dishCopy = dish;
                },
                errmess => { 
                    this.dish = null; 
                    this.dishCopy = null; 
                    this.errMess = <any>errmess; 
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
