import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { FieldConfig } from "../field.interface";
@Component({
  selector: "app-input",
  template: `
<mat-form-field [class]="field.class" [formGroup]="group">
<input matInput [formControlName]="field.name" [placeholder]="field.label" [type]="field.inputType">
<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
<mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
</ng-container>
</mat-form-field>
`,
  styleUrls: ['../style.scss']
})
export class InputComponent implements OnInit {
  field: FieldConfig;
  group: UntypedFormGroup;
  constructor() {}
  ngOnInit() {}
}
