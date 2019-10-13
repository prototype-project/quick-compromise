<template>
    <form class="needs-validation" novalidate>
        <div class="alert alert-danger" v-if="hasRegisterError()" role="alert">
            {{ errors["register_error"] }}
        </div>
        <div class="form-row">
            <div class="col-md-6 mb-3">
                <input v-model="formInput.username" class="form-control"
                       v-bind:class="{ 'is-invalid': isInvalid(fields.USERNAME_FIELD), 'is-valid': isValid(fields.USERNAME_FIELD) }"
                       placeholder="Username">
                <div class="invalid-feedback">
                    {{errors[fields.USERNAME_FIELD]}}
                </div>
            </div>
        </div>
        <div class="form-row">
            <div class="col-md-6 mb-3">
                <input type="password" v-model="formInput.password" class="form-control"
                       v-bind:class="{ 'is-invalid': isInvalid(fields.PASSWORD_FIELD), 'is-valid': isValid(fields.PASSWORD_FIELD) }"
                       placeholder="Password">
                <div class="invalid-feedback">
                    {{ errors[fields.PASSWORD_FIELD] }}
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-primary" v-on:click="submit()">Sign up</button>
    </form>
</template>

<script>
  import {RegisterError} from "./user";

  const fields = {
    USERNAME_FIELD: "username_field",
    PASSWORD_FIELD: "password_field"
  };

  export default {
    props: {
      user: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        fields: fields,
        errors: {},
        formInput: {
          submitted: false,
          username: '',
          password: ''
        }
      }
    },
    methods: {
      async submit() {
        this.formInput.submitted = true;
        if (this.validate()) {
          await this.register();
        }
      },
      validate() {
        this.errors = {};
        if (!this.formInput.username) {
          this.errors[fields.USERNAME_FIELD] = "Username is required";
        }
        if (!this.formInput.password) {
          this.errors[fields.PASSWORD_FIELD] = "Password is required";
        }
        return _.isEmpty(this.errors);
      },
      async register() {
        if (!this.user.isAuthenticated()) {
          this.user.setCredentials(this.formInput.username, this.formInput.password);
          try {
            await this.user.create();
            await this.user.authenticate();
          } catch (e) {
            if (e instanceof RegisterError) {
              this.errors["register_error"] = "User with given username already exists";
            } else {
              this.errors["register_error"] = "Unexpected error. Try again :(";
            }
            this.$forceUpdate();
          }
        }
      },
      isValid(field) {
        return this.formInput.submitted && !this.errors[field];
      },
      isInvalid(field) {
        return this.formInput.submitted && this.errors[field];
      },
      hasRegisterError() {
        let error = this.errors["register_error"];
        return !_.isUndefined(error) && !_.isEmpty(error) && this.formInput.submitted;
      }
    }
  }
</script>