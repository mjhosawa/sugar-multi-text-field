({
    events: {
        'change .addInput': 'addInputField',
        'click  .addInput': 'addInputField',
        'click  .removeInput': 'removeExistingInput',
        'change .existingText': 'updateExistingInput',
    },

    initialize: function (options) {
        this._super('initialize', [options]);
    },

    addInputField: function (evt) {
        let text = this.$(evt.currentTarget).val() || this.$('.newInput').val();
        text = text.trim();

        if (!_.isEmpty(text) && (this._addInputsToModel(text))) {
            // append the new field before the new text input
            let textHtml = this._buildFieldHtml(text);
            this._getInputField().closest('.multi-text').before(textHtml);
        }

        this._clearInputField();
    },

    _addInputsToModel: function (value) {
        let success = false,
            texts = this.model.get(this.name) ? this.model.get(this.name) : [],
            duplicates = _.find(texts, function (i) {
                return (texts.length > 1 && i === value);
            });

        if (_.isUndefined(duplicates)) {
            texts.push(value);
            this.model.set(this.name, texts);
            success = true;
        }

        return success;
    },

    _buildFieldHtml: function (text) {
        let editFieldTpl = app.template.getField('multi-text', 'edit-text-field', this.module);
        let texts = this.model.get(this.name);
        let index = _.indexOf(texts, text);

        return editFieldTpl({
            index: index === -1 ? texts.length - 1 : index,
            text: text,
        });
    },

    _getInputField: function () {
        return this.$('.newInput');
    },

    _clearInputField: function () {
        this._getInputField().val('');
    },

    updateExistingInput: function (evt) {
        let $inputs = this.$('.existingText'),
            $input = this.$(evt.currentTarget),
            index = $inputs.index($input),
            newInput = $input.val();

        newInput = newInput.trim();

        if (newInput === '') {
            this._removeExistingInModel(index);
            $input.closest('.multi-text').remove();
            return;
        }

        this._updateExistingInModel(index, newInput);
    },

    _updateExistingInModel: function (index, newInput) {
        var existingInputs = this.model.get(this.name);
        existingInputs[index] = newInput;

        if (this.tplName === 'edit') {
            this.model.set(this.name + (index + 1), newInput);
        }

        this.model.set(this.name, existingInputs);
    },

    removeExistingInput: function (evt) {
        let $deleteButtons = this.$('.removeInput'),
            $deleteButton = this.$(evt.currentTarget),
            index = $deleteButtons.index($deleteButton);

        $deleteButton.closest('.multi-text').remove();
        this._removeExistingInModel(index);
    },

    _removeExistingInModel: function (index) {
        let texts = this.model.get(this.name);
        texts = _.reject(texts, function (textInfo, i) {
            return i == index;
        });

        this.model.set(this.name, texts);
        this._render();
    },

    format: function (value) {
        return value;
    },

    unformat: function (value) {
        var texts = this.model.get(this.name);

        // texts is empty, initialize array
        if (!_.isArray(texts)) texts = [];

        if (texts.length == 0) texts.push(value);

        return texts;
    },

    _render: function () {
        let html = '';
        this._super('_render');

        if (this.tplName === 'edit') {
            _.each(this.value, function (text) {
                html += this._buildFieldHtml(text);
            }, this);
            this.$el.prepend(html);
        }
    }
})
