var FinancialAssessmentws = (function() {
   "use strict";

    var financial_assessment = {};

    var init = function() {
        if (checkIsVirtual()) return;
        $("#assessment_form").on("submit",function(event) {
            event.preventDefault();
            submitForm();
            return false;
        });
        BinarySocket.send({get_financial_assessment : 1});
    };

    var submitForm = function() {
        $('#submit').attr('disabled', 'disabled');

        if (!validateForm()) {
            setTimeout(function() { $('#submit').removeAttr('disabled'); }, 1000);
            return;
        }

        var hasChanged = false;
        Object.keys(financial_assessment).forEach(function(key) {
            if ($('#' + key).length && $('#' + key).val() != financial_assessment[key]) {
                hasChanged = true;
            }
        });
        if (Object.keys(financial_assessment).length === 0) hasChanged = true;
        if (!hasChanged) {
            showFormMessage('You did not change anything.', false);
            setTimeout(function() { $('#submit').removeAttr('disabled'); }, 1000);
            return;
        }

        showLoadingImage($('#form_message'));
        var data = {'set_financial_assessment' : 1};
        $('#assessment_form select').each(function() {
            financial_assessment[$(this).attr('id')] = data[$(this).attr('id')] = $(this).val();
        });
        BinarySocket.send(data);
    };

    var validateForm = function() {
        var isValid = true,
            errors = {};
        clearErrors();
        $('#assessment_form select').each(function() {
            if (!$(this).val()) {
                isValid = false;
                errors[$(this).attr("id")] = text.localize('Please select a value');
            }
        });
        if (!isValid) {
            displayErrors(errors);
        }

        return isValid;
    };

    var showLoadingImg = function() {
        showLoadingImage($('<div/>', {id: 'loading', class: 'center-text'}).insertAfter('#heading'));
        $("#assessment_form").addClass('invisible');
    };

    var hideLoadingImg = function(show_form) {
        $("#loading").remove();
        if (typeof show_form === 'undefined') {
            show_form = true;
        }
        if (show_form) {
            $("#assessment_form").removeClass('invisible');
        }
    };

    var responseGetAssessment = function(response) {
        hideLoadingImg();
        financial_assessment = response.get_financial_assessment;
        for(var key in response.get_financial_assessment) {
            if (key) {
                var val = response.get_financial_assessment[key];
                $('#' + key).val(val);
            }
        }
    };

    var clearErrors = function() {
        $('.errorfield').each(function() { $(this).text(''); });
    };

    var displayErrors = function(errors) {
        var id;
        clearErrors();
        for(var key in errors) {
            if(key){
                var error = errors[key];
                $('#error' + key).text(text.localize(error));
                if (!id) id = key;
            }
        }
        hideLoadingImg();
        $('html, body').animate({
            scrollTop: $('#' + id).offset().top
        }, 'fast');
    };

    var apiResponse = function(response) {
        if (checkIsVirtual()) return;
        if (response.msg_type === 'get_financial_assessment'){
            responseGetAssessment(response);
        } else if (response.msg_type === 'set_financial_assessment') {
            $('#submit').removeAttr('disabled');
            if ('error' in response) {
                showFormMessage('Sorry, an error occurred while processing your request.', false);
                displayErrors(response.error.details);
            } else {
                showFormMessage('Your settings have been updated successfully.', true);
            }
        }
    };

    var checkIsVirtual = function() {
        if (page.client.is_virtual()) {
            $("#assessment_form").addClass('invisible');
            $('#response_on_success').addClass('notice-msg center-text').removeClass('invisible').text(text.localize('This feature is not relevant to virtual-money accounts.'));
            hideLoadingImg(false);
            return true;
        }
        return false;
    };

    var showFormMessage = function(msg, isSuccess) {
        $('#form_message')
            .attr('class', isSuccess ? 'success-msg' : 'errorfield')
            .html(isSuccess ? '<ul class="checked" style="display: inline-block;"><li>' + text.localize(msg) + '</li></ul>' : text.localize(msg))
            .css('display', 'block')
            .delay(5000)
            .fadeOut(1000);
        if (isSuccess) {
            setTimeout(function() { window.location.href = page.url.url_for('user/settings/metatrader', '#financial'); }, 5000);
        }
    };

    var onLoad = function() {
        BinarySocket.init({
            onmessage: function(msg) {
                var response = JSON.parse(msg.data);
                if (response) {
                    FinancialAssessmentws.apiResponse(response);
                }
            }
        });
        showLoadingImage($('<div/>', {id: 'loading', class: 'center-text'}).insertAfter('#heading'));
        FinancialAssessmentws.init();
    };

    return {
        init       : init,
        apiResponse: apiResponse,
        submitForm : submitForm,
        onLoad     : onLoad,
    };
}());
