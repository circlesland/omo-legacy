<script>
  import {onMount} from "svelte";
  import mocker from "mocker-data-generator";

  var user = {
    firstName: {
      faker: "name.firstName"
    },
    lastName: {
      faker: "name.lastName"
    },
    country: {
      faker: "address.country"
    },
    createdAt: {
      faker: "date.past"
    },
    username: {
      function: function () {
        return (
                this.object.lastName.substring(0, 5) +
                this.object.firstName.substring(0, 3) +
                Math.floor(Math.random() * 10)
        );
      }
    }
  };

  onMount(async () => {
    mocker()
            .schema("user", user, 20)
            .build()
            .then(
                    data => {
                      data = data;
                    },
                    err => console.error(err)
            );
  });
</script>

<!-- 
export let omos = [
  {
    _id: "omo1",
    type: "OmoSapien",
    first: "omo",
    last: "sapiens",
    wallet: "wallet1",
  },
  {
    _id: "omo2",
    type: "OmoSapien",
    first: "omo",
    last: "sapiens",
    wallet: "wallet2",
  },
];

export let wallets = [
  {
    _id: "wallet1",
    owner: "omo1",
    balance: "523",
    transactions: ["transaction1", "transaction2"],
    streams: ["stream1"],
  },
  {
    _id: "wallet2",
    owner: "orga1",
    balance: "5233",
    transactions: ["transaction3", "transaction4"],
    streams: ["stream2"],
  },
];

export let dreams = [
  {
    _id: "",
    type: "Dream",
    name: "dream 1",
    dreamers: ["omo1", "omo2"],
    title: "",
    description: "",
    image: "",
    city: "",
    stage: "dream",
    state: "active",
    levels: [
      {
        _id: "",
        type: "Level",
        name: "level 1",
        state: "locked",
        steps: [
          {
            _id: "",
            type: "Step",
            name: "Step 1",
            state: "locked",
          },
        ],
      },
    ],
  },
  {
    _id: "",
    type: "Dream",
    name: "dream 1",
    dreamers: ["omo1", "omo2"],
    stage: "dream",
    state: "done",
    levels: [
      {
        _id: "",
        type: "Level",
        name: "level 1",
        state: "locked",
        goal: 5,
        steps: [
          {
            _id: "",
            type: "Step",
            name: "Step 1",
            state: "locked",
            goal: 1,
          },
          {
            _id: "",
            type: "Step",
            name: "Step 2",
            state: "locked",
            goal: 2,
          },
          {
            _id: "",
            type: "Step",
            name: "Step 3",
            state: "locked",
            goal: 3,
          },
          {
            _id: "",
            type: "Step",
            name: "Step 4",
            state: "locked",
            goal: 5,
          },
        ],
      },
    ],
  },
];

export let orgas = [
  {
    _id: "",
    name: "quantum leap earth",
    wallet: "wallet2",
    services: ["service1"],
  },
];

export let services = [
  {
    _id: "service1",
    name: "service 1",
    price: 100,
    discounts: {
      80: "80%",
      60: "60%",
      40: "40%",
      20: "20%",
    },
    interval: "weekly",
    streams: ["stream1", "stream2"],
  },
];

export let streams = [
  {
    _id: "stream1",
    name: "Stream 1",
    service: "service1",
    amount: "5",
    wallet: "wallet1",
    startdate: "01.01.01",
  },
]; -->
