const ApiService          = require("services/ApiService");
const NotificationService = require("services/NotificationService");
const ModalService        = require("services/ModalService");

import ValidationService from "services/ValidationService";

Vue.component("login", {

    props: [
        "modalElement",
        "backlink",
        "hasToForward",
        "template"
    ],

    data()
    {
        return {
            password: "",
            username: "",
            isDisabled: false,
            isPwdReset: false
        };
    },

    created()
    {
        this.$options.template = this.template;
    },

    methods: {
        /**
         * Open the login modal
         */
        showLogin()
        {
            ModalService.findModal(document.getElementById(this.modalElement)).show();
        },

        validateLogin()
        {
            if (!this.isPwdReset)
            {
                ValidationService.validate($("#login-form-" + this._uid))
                    .done(() =>
{
                        this.sendLogin();
                    })
                    .fail(invalidFields =>
{
                        ValidationService.markInvalidFields(invalidFields, "error");
                    });
            }
        },

        validateResetPwd()
        {
            if (this.isPwdReset)
            {
                ValidationService.validate($("#reset-pwd-form-" + this._uid))
                    .done(data =>
{
                        this.sendResetPwd();
                    })
                    .fail(invalidFields =>
{
                        ValidationService.markInvalidFields(invalidFields, "error");
                    });
            }
        },

        /**
         * Send the login data
         */
        sendLogin()
        {
            this.isDisabled = true;

            ApiService.post("/rest/io/customer/login", {email: this.username, password: this.password}, {supressNotifications: true})
                .done(response =>
                {
                    ApiService.setToken(response);

                    if (document.getElementById(this.modalElement) !== null)
                    {
                        ModalService.findModal(document.getElementById(this.modalElement)).hide();
                    }

                    NotificationService.success(Translations.Template.accLoginSuccessful).closeAfter(10000);

                    if (this.backlink !== null && this.backlink)
                    {
                        location.assign(this.backlink);
                    }
                    else if (this.hasToForward)
                    {
                        location.assign(location.origin);
                    }
                    else
                    {
                        location.reload();
                    }

                    this.isDisabled = false;
                })
                .fail(response =>
                {
                    this.isDisabled = false;

                    switch (response.code)
                    {
                    case 401:
                        NotificationService.error(Translations.Template.accLoginFailed).closeAfter(10000);
                        break;
                    default:
                        return;
                    }
                });
        },

        /**
         *  Reset password
         */
        sendResetPwd()
        {
            this.isDisabled = true;

            ApiService.post("/rest/io/customer/password_reset", {email: this.username})
                .done(() =>
                {
                    if (document.getElementById(this.modalElement) !== null)
                    {
                        ModalService.findModal(document.getElementById(this.modalElement)).hide();
                    }

                    NotificationService.success("PwdReset").closeAfter(10000);

                    this.isDisabled = false;

                    this.cancelResetPwd();

                })
                .fail(() =>
                {
                    this.isDisabled = false;
                });
        },

        showResetPwdView()
        {
            const tooltip = "data-toggle=\"tooltip\" data-placement=\"right\" title=\"jknk\"";

            this.isPwdReset = true;

            if (document.getElementById(this.modalElement) !== null)
            {
                $(".modal-title").html(Translations.Template.accForgotPassword + " <i class=\"fa fa-question-circle-o\" aria-hidden=\"true\" " + tooltip + "></i>");
            }
            else
            {
                $(".login-view-title").html(Translations.Template.accForgotPassword + " <i class=\"fa fa-question-circle-o\" aria-hidden=\"true\" " + tooltip + "></i>");
            }

            $(".login-container").slideUp("fast", function()
            {
                $(".reset-pwd-container").slideDown("fast");
            });
        },

        cancelResetPwd()
        {
            this.isPwdReset = false;

            if (document.getElementById(this.modalElement) !== null)
            {
                $(".modal-title").text(Translations.Template.accLogin);
            }
            else
            {
                $(".login-view-title").text(Translations.Template.accLogin);
            }

            $(".reset-pwd-container").slideUp("fast", function()
            {
                $(".login-container").slideDown("fast");
            });
        }
    }
});
