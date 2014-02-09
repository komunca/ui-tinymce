/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.tinymce', []).value('uiTinymceConfig', {}).directive('uiTinymce', [ 'uiTinymceConfig', function(uiTinymceConfig){
    uiTinymceConfig = uiTinymceConfig || {};
    var generatedIds = 0;
    return {
        require : 'ngModel',
        link : function(scope, elm, attrs, ngModel){
            var expression, options, tinyInstance, updateView = function(){
                ngModel.$setViewValue(elm.val());
                if (!scope.$root.$$phase) {
                    scope.$apply();
                }
            };
            // generate an ID if not present
            if (!attrs.id) {
                attrs.$set('id', 'uiTinymce' + generatedIds++);
            }

            if (attrs.uiTinymce) {
                expression = scope.$eval(attrs.uiTinymce);
            }
            else {
                expression = {};
            }
            options = {
                // Update model when calling setContent (such as from the source
                // editor popup)
                mode : 'exact',
                elements : attrs.id
            };
            // extend options with initial uiTinymceConfig and options from
            // directive attribute value
            angular.extend(options, uiTinymceConfig, expression);
            // This should be called after doing angular.extend otherwise it
            // gets replaced by the one that's inside express
            options.setup = function(ed){
                var args;

                ed.onInit.add(function(ed, cmd, ui, val){
                    ngModel.$render();
                });

                ed.onExecCommand.add(function(ed, cmd, ui, val){
                    ed.save();
                    updateView();
                });

                ed.onKeyUp.add(function(ed, cmd, ui, val){
                    ed.save();
                    updateView();
                });

                ed.onSetContent.add(function(ed, cmd, ui, val){
                    if (!cmd.initial) {
                        ed.save();
                        updateView();
                    }
                });

                if (expression != undefined && expression.setup) {
                    expression.setup(ed);
                    delete expression.setup;
                }
            };
            setTimeout(function(){
                tinymce.init(options);
            }, 100);

            ngModel.$render = function(){
                if (!tinyInstance) {
                    tinyInstance = tinymce.get(attrs.id);
                }
                if (tinyInstance) {
                    tinyInstance.setContent(ngModel.$viewValue || '');
                }
            };
        }
    };
} ]);
