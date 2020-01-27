omo.quant(
  class Demo extends omo.quanta.Quant {
    static get styles() {
      return [
        omo.normalize,
        omo.css``
      ];
    }
    constructor() {
      super();
      this.required = "";
      this.disabled = "I'm disabled";
    }

    render() {
      return omo.html`
      <p>TODO</p>
      `;
    }

    static get model() {
      return {
        relation: {
          type: "relation",
          quant: this,
          display: "string"
        },
        string: {
          type: "string"
        },
        stringpattern: {
          type: "string",
          pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$",
          onError: "Bitte eine gültige email eingeben"
        },
        disabled: {
          type: "string",
          disabled: true
        },
        required: {
          type: "string",
          required: true
        },
        boolean: {
          type: "boolean"
        },
        number: {
          type: "number"
        },
        email: {
          type: "email",
          pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$",
          onError: "Bitte eine gültige email eingeben"
        },
        password: {
          type: "password"
        },
        hardPassword: {
          type: "password",
          pattern: ".{6,}",
          onError: "Mindestens 6 Zeichen"
        },
        file: {
          type: "file"
        },
        color: {
          type: "color"
        },
        date: {
          type: "date"
        },
        datetimelocal: {
          type: "datetime-local"
        },
        month: {
          type: "month"
        },
        week: {
          type: "week"
        },
        url: {
          type: "url"
        },
        search: {
          type: "search"
        },
        tel: {
          type: "tel"
        }



      };
    }

    static get properties() {
      return super.properties;
    }
  }
);