 const db = {
   cities: [{
       id: 1,
       name: "Berlin",
       image: "https://source.unsplash.com/TK5I5L5JGxY"
     },
     {
       id: 2,
       name: "München",
       image: "https://source.unsplash.com/8QJSi37vhms "
     },
     {
       id: 3,
       name: "Heidelberg",
       image: "https://source.unsplash.com/Yfo3qWK2pjY"
     },
     {
       id: 4,
       name: "Neue Stadt",
       image: "/images/addcity.jpg"
     }
   ],
   users: [{
       id: 1,
       name: "Julian",
       dream: "liebt das Fahren und den Dialog mit seinen Mitfahrern",
       image: "https://source.unsplash.com/7YVZYZeITc8",
       city: 1
     },
     {
       id: 2,
       name: "Adele",
       dream: "liebt es Nachts durch die Stadt von München zu düsen",
       city: 2,
       image: "https://source.unsplash.com/xe68QiMaDrQ"
     },
     {
       id: 3,
       name: "Lisa",
       dream: "liebt es mit der Rikscha den Berg hochzustrampeln",
       city: 3,
       image: "https://source.unsplash.com/rDEOVtE7vOs"
     }
   ]
 };

 export default db;