// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1);

// this event will emit if the database version changes
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `transactions`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('funds', { autoIncrement: true });
};

  // upon a successful db creation
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadFunds() function to send all local db data to api
    if (navigator.onLine) {
        // Call upload function
        uploadFunds();
    }
};
  
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new change in funds and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['funds'], 'readwrite');
  
    // access the object store for `funds`
    const budgetObjectStore = transaction.objectStore('funds');
  
    // add record to your store with add method
    budgetObjectStore.add(record);
};


function uploadFunds() {
   
    const transaction = db.transaction(['funds'], 'readwrite');
  

    const budgetObjectStore = transaction.objectStore('funds');
  
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
  r
    if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['funds'], 'readwrite');
    
          const budgetObjectStore = transaction.objectStore('funds');
         
          budgetObjectStore.clear();

          alert('All saved transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
};
window.addEventListener('online', uploadFunds);