/**
 * Биндинг для jQuery UI labeledSlider
 * 
 */

$(function() {
    ko.bindingHandlers.labeledSlider = {

        init: function (element, valueAccessor) {

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                try { $(element).labeledslider('destroy'); }
                catch (err) { }
            });

            var value = valueAccessor(),
                config = ko.unwrap(value);

            //console.log('---------------------- ko.bindingHandlers.labeledSlider', config);

            if(config) {
                $(element).labeledslider(config);
            }
        },

        update: function (element, valueAccessor) {
            var value = valueAccessor(),
                config = ko.unwrap(value);

            if (config) {
                $(element).labeledslider(config);
            } else {
                try { 
                    $(element).labeledslider('destroy'); 
                } catch (err) { 
                    // pass
                }
            }
        }
    };
});