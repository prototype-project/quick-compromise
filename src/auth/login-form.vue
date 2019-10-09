<template>
    <form class="needs-validation" novalidate>
        <div class="alert alert-danger" v-if="hasAuthError()" role="alert">
            {{ errors["auth_error"] }}
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
        <button type="button" class="btn btn-primary" v-on:click="submit()">Login</button>
    </form>
</template>

<script>
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
          await this.login();
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
      async login() {
        if (!this.user.isAuthenticated()) {
          this.user.setCredentials(this.formInput.username, this.formInput.password);
          try {
            await this.user.authenticate();
          } catch (e) {
            this.$forceUpdate();
            this.errors["auth_error"] = "Invalid username or password";
          }
        }
      },
      isValid(field) {
        return this.formInput.submitted && !this.errors[field];
      },
      isInvalid(field) {
        return this.formInput.submitted && this.errors[field];
      },
      hasAuthError() {
        let error = this.errors["auth_error"];
        return !_.isUndefined(error) && !_.isEmpty(error) && this.formInput.submitted;
      }
    }
  }
</script>