import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/Promotion';
import { PromotionService } from '../services/promotion.service';
import { LeaderService } from '../services/leader.service';
import { Leader } from '../shared/leader';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dish: Dish;
  promotion: Promotion;
  featuredLeader: Leader;
  dishErrMess: string;

  constructor(private dishservice: DishService,
    private promotionservice: PromotionService,
    private leaderService: LeaderService,
    @Inject("BaseURL") public BaseURL) { }

  ngOnInit() {
    this.dishservice.getFeaturedDish()
        .subscribe(dish => this.dish = dish,
                    errMess => this.dishErrMess = errMess);
    this.promotionservice.getFeaturedPromotion()
        .subscribe(promo => this.promotion = promo);
    this.leaderService.getFeaturedLeader()
        .subscribe(leader => this.featuredLeader = leader);
  }

}
