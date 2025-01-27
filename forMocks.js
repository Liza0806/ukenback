const groups = [
  {
    _id: "1",
    title: "Group 1",
    coachId: "coach1",
    dailyPayment: 0,  
    monthlyPayment:0,
    schedule: [],
    participants: [],
  },
  {
    _id: "2",
    title: "Group 2",
    coachId: "coach2",
    dailyPayment: 0,  
    monthlyPayment:0,
    schedule: [],
    participants: [],
  },
];
//: EventTypeDB[]
 const events= [    
    {
      _id: "1",
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    },
    {
      _id: "2",
      groupTitle: "groupTitle 2",
      groupId: "2",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    },
  ];
  const validGroup = {
    _id: "1",
    title: "Group 1",
    coachId: "coach1",

        dailyPayment: 500,
        monthlyPayment: 10000,
    
    schedule: [
        { day: "Monday", time: "10:00" },
        { day: "Wednesday", time: "15:30" },
      ],
    participants: [{
        _id: "p1",
        name: "John Doe",
        telegramId: 123456789
      },
      {
        _id: "p2",
        name: "Jane Doe",
        telegramId: 123456790
      },
      {
        _id: "p3",
        name: "Justin Doe",
        telegramId: 123456791
      }
    ],
  };
  const users= [ //: User[] 
      {
        _id: "1",
        name: "userName 1",
        password: "111",
        phone: "11111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
   
        visits: [],
      },
      {
        _id: "2",
        name: "userName 2",
        password: "222",
        phone: "22222",
        isAdmin: true,
        groups: [],
        balance: 22,
        telegramId: 222,
     
        visits: [],
      },
    ];