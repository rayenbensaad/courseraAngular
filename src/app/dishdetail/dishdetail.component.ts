import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
     
    visibility(),
    flyInOut(),
    expand()    
  ]
})
export class DishdetailComponent implements OnInit {
 
  feedbackForm: FormGroup;
  dish: Dish;
  dishIds: string[];
  errMess: string;
  prev: string;
  next: string;
  dishcopy: Dish;
  comment: Comment;
  visibility = 'shown';



  @ViewChild('fform') feedbackFormDirective;


    formErrors = {
    'author': '',
    'comment': ''
  };
  
    validationMessages = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Author name must be at least 2 characters long.',
      'maxlength':     'Author Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Last Name must be at least 2 characters long.',
    },
    };

  constructor(private dishService: DishService, private route: ActivatedRoute, private  location:Location, private fb: FormBuilder,
  @Inject('BaseURL') private BaseURL) {
  this.createForm();
   }

  ngOnInit() {

    this.dishService.getDishIds()
    .subscribe(dishIds => this.dishIds = dishIds);

    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(+params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
  }

 
  createForm() {
      this.feedbackForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating: '5',
      comment: ['', [Validators.required, Validators.minLength(2)]]
    });
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
    }
  

   onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
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





  onSubmit() {
    var d = new Date();
    var n = d.toISOString();
    this.feedbackForm.value.date = n;
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });    this.feedbackForm.reset({
      author: '',
      rating: 5,
      comment: '',
    });
    this.feedbackFormDirective.resetForm();
  }


  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void{
  this.location.back();
  }
}