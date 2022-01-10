import { Component } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

enum ProjectStatus {
  STABLE = 'Stable',
  CRITICAL = 'Critical',
  DONE = 'Finished'
};

enum ProjectFormControl {
  NAME = 'name',
  EMAIL = 'email',
  STATUS = 'status'
};

enum ValidationErrorName {
  REQUIRED = 'required',
  BUSY = 'busy'
};

const nameBusyValidator = (busyNames: string[]): AsyncValidatorFn => (control: FormControl): Observable<ValidationErrors> => {
  return new Observable((subscriber) => {
    const value = control.value?.toLowerCase();
    const forbiddenArr = busyNames.map(w => w.toLowerCase());
    const validationError = {
      [ValidationErrorName.BUSY]: value
    };

    setTimeout(
      () => {
        const errors = forbiddenArr.includes(value)
          ? validationError
          : undefined;

        subscriber.next(errors);
        subscriber.complete();
      },
      1000
    )
  })
};

const DEFAULT_PROJECT_STATUS = ProjectStatus.STABLE;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ProjectStatus = ProjectStatus;

  ProjectFormControl = ProjectFormControl;

  statusOptions = Object.values(ProjectStatus);

  submitted = false;

  submittedProjectNames: string[] = []

  projectForm = new FormGroup({
    [ProjectFormControl.NAME]: new FormControl('', Validators.required, nameBusyValidator(this.submittedProjectNames)),
    [ProjectFormControl.EMAIL]: new FormControl('', [Validators.required, Validators.email]),
    [ProjectFormControl.STATUS]: new FormControl(DEFAULT_PROJECT_STATUS, Validators.required)
  });

  getNameErrorMessage = () => {
    if (this.isNameEmpty()) {
      return "Project name cannot be empty!";
    }

    if (this.isNameBusy()) {
      return "Sorry, but this project name is already allocated!";
    }
  }

  isNameEmpty = () => {
    const { errors } = this.projectForm.get(ProjectFormControl.NAME);
    return errors && !!errors[ValidationErrorName.REQUIRED];
  }

  isNameBusy = () => {
    const { errors } = this.projectForm.get(ProjectFormControl.NAME);
    return errors && !!errors[ValidationErrorName.BUSY];
  }

  isNameAvailiable = () => {
    const { errors } = this.projectForm.get(ProjectFormControl.NAME);
    return !this.showPending(ProjectFormControl.NAME) && !errors
  }

  showPending = (controlName: ProjectFormControl) => {
    const control = this.projectForm.get(controlName);
    return control.pending;
  }

  showErrors = (controlName: ProjectFormControl) => {
    const control = this.projectForm.get(controlName);
    return !control.valid && control.touched && !control.pending;
  }

  showFormErrors = () => {
    return !this.projectForm.valid && this.projectForm.touched;
  }

  onSubmit = () => {
    this.submitted = true;
    this.submittedProjectNames.push(this.projectForm.value[ProjectFormControl.NAME])
  }

  onReset = () => {
    this.submitted = false;
    this.projectForm.controls[ProjectFormControl.NAME].setAsyncValidators(nameBusyValidator(this.submittedProjectNames));
    this.projectForm.reset({
      [ProjectFormControl.STATUS]: DEFAULT_PROJECT_STATUS
    });
  }
}
