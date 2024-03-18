'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'John Doe',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2023-02-08T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-02-10T17:01:17.194Z',
    '2023-02-11T23:36:17.929Z',
    '2023-02-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2023-02-14T15:01:20.884Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// funkcija koja podesava datume pored movementsa
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);  // Da budu dva broja i prvi da je 0 ako je jednocifren broj npr. 01
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// funkcija koja podesava formatiranje brojeva u aplikaiji
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]); // Prolazimo pomocu indeksa kroz svaki datum u movementsDate nizu
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Ukupan balans
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

// Prihodi, troskovi, inters
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  // Prvimo ovu funkciju zato sto se setInterval izvrsi nakon jedne sekunde i ocemo da na ekranu odma krene odbrojavanje
  // zato najprije pozovemo ovu funkciju zasebno a onda se ona u setInterval izvrsava svake sekunde
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaning time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }

    // Decrese 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timerr;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    //const locale = navigator.language;
    //console.log(locale);   // sr-RS kod mene

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    /*
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth()}`.padStart(2, 0);  // Da budu dva broja i prvi da je 0 ako je jednocifren broj npr. 01
    const year = now.getFullYear();
    const hours = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hours}:${min}`;
    day/month/year
    */

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timerr) clearInterval(timerr); // Ako vec postoji timer obrisi ga, npr ako smo u js nalogu i traje timer kada predjemo u jd nalog on vec postoji i treba da se obrise
    timerr = startLogOutTimer(); // Zatim postavi ponovo

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timerr);
    timerr = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Da kada uzmemo zajam na ekranu se ispise nakon par sekundi

      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString()); // toISIString() pravi datume u istom formatu kao sto su u movementsDates

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timerr);
      timerr = startLogOutTimer();
    }, 3000);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Converting and Checking Numbers
/*
console.log(20 === 20.0); // Svi brojevi u js po defaultu su decimalni
console.log(0.1 + 0.2 === 0.3);  // false

// converting string to numbers
console.log(Number('23'));
console.log(+'23'); // Nacin da se izvrsi konverzija iz stringa u broj


// Parasing
console.log(Number.parseInt('30px', 10));  // Automatski prepoznaje i vadi broj 30
console.log(Number.parseInt('e20', 10));  // Ovo nece raditi jer string mora poceti brojem

console.log(Number.parseFloat('2.5rem'));
console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('  2.5rem '));

// Provjerava da li vrijednost nije broj - NaN
console.log(Number.isNaN(20)); // Provjerava da li vrijednost nije Number
console.log(Number.isNaN('45'));  // false takodje
console.log(Number.isNaN(+'23x'));  // true, zato sto pokuavamo pretvoriti nesto sto nije number
console.log(Number.isNaN(20 / 0));   // false


// isFinite() - provjerava da li je broj Number
console.log(Number.isFinite(20));  // Bolji nacin za provjeriti da li je broj Number
console.log(Number.isFinite('20'));  
console.log(Number.isFinite(+'20xp'));  // false
console.log(Number.isFinite(20 / 0));   // false zato sto dijeljenje sa nulom nije moguce i to je infinty objekat


// Provjerava da li je broj Integer
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.1));  // false
console.log(Number.isInteger(23 / 0));  // false



// ---- Math and Rounding ----
console.log(Math.sqrt(25));  // Korijen
console.log(25 ** (1/2));  // Isto dobijemo korijen

console.log(8 ** (1/3));  // Kubni broj broja 8

console.log(Math.max(5, 6, 4, 22, 5, 9));  // maks br
console.log(Math.max(5, 6, 4, '22', 5, 9));  // Radi i ovako

console.log(Math.min(5, 6, 4, 22, 5, 9));  // min br

console.log(Math.PI * Number.parseFloat('10px') ** 2);  // Obim kurga


console.log(Math.trunc(Math.random() * 6) + 1);

// min dodajemo na kraju da nikada ne bi imali negativne vrijednosti
const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min; 

console.log(randomInt(20, 10));


// Rounding intengers
console.log(Math.round(23.9));  // Zaokruzuje broj ako na manji ili veci od zavisnosti od decimalnog nastavka


console.log(Math.ceil(23.3));  // Zaokruzuje uvijek na veci broj

console.log(Math.floor(24.9)); // Zaokruzuje uvijek na manji broj

console.log(Math.trunc(23.4)); // Brise decimalni dio, isto radi kao floor na manji br zaokruzuje

console.log(Math.trunc(-22.3)); // Kada su negativni br idalje zaokruzuje na manji
console.log(Math.floor(-22.3)); // Kada su negativni br zaokruzuje na veci


// Rounding decimals
console.log((2.77).toFixed(0));  // 3 -> i uvijek vraca string a ne broj
console.log((2.77).toFixed(1));  // 2.8 -> zaokruzuje decimalni dio

console.log((2.7).toFixed(3)); // 2.700

console.log(+(2.345).toFixed(2)); // Kada stavimo + ispred znaci da konvertujemo string u number



// ---- The Remainder Operator ----
console.log(5 % 2);
 
console.log(6 % 2);

const isEven = n => n % 2 === 0;

console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(10));


labelBalance.addEventListener('click', function(){
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  })
})



// ---- Numeric Separators ----
const diameter = 287_460_000_000;  // Da se lakse moe citati broj
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

const transferFee1 = 15_00;
const transferFee2 = 1_500; // Ovo je isti broj

const PI = 3.14_15;
console.log(PI);

console.log(Number('23_000')); // Ovo nece raditi dobicemo NaN
console.log(parseInt('23_000'));  // 23





//---- Working with BigInt ----
console.log(2 ** 53 - 1); // Najveci broj koji JS moze reprezentovati u ovikru od 53 bita
console.log(Number.MAX_SAFE_INTEGER); // Daje nam isti broj

console.log(4234423453463463562346346354n); // Kada stavimo n na kraju to oznacava da je broj bigInt sto znaci da je izvan najveceg opsega sigurnog integera
console.log(BigInt(4234423453463463562346346354)); // Isti rezultat


// Operations
console.log(10000n + 10000n);
console.log(10000452346234623563574575524572524n * 100002653573463663n);
console.log(1036246023634400n - 10005455120n);
console.log(13455346324635632635223460000n / 1000342633460n);

//console.log(23492304023049n + 1000);  // Ne mogu se vrsiti operacije izmedju bigInt i int

// console.log(Math.sqrt(16n));  // Ovo ne moze

const huge = 234235463463464334634634n;
const num = 23;
console.log(huge * BigInt(num)); // Moramo prvo konvertovati


// Exceptions
console.log(20n > 15);  // Ovo radi i dobijamo true
console.log(15n === 15);  // Ovo je false
// To je zato kada koristimo triple operator === Js ne radi automatsku konverziju 

console.log(15n == 15);  // true zato sto double operator radi automatsku konverziju

console.log(typeof 20n);

console.log(huge + ' is really big number!!!');


// Devisions
console.log(10n / 3n); // 3n - bigInt zaokruzuje broj na cijeli dio
console.log(10 / 3);  // 3.3333333333333335




// ---- Creating Dates ----
const now = new Date();
console.log(now);

console.log(new Date('Mon Feb 13 2023 12:22:12'));

console.log(new Date(account1.movements[0]));

console.log(new Date(2037, 10, 19, 23, 5)); // Mjeseci u JS krecu od 0 pa je zato 10 novembar
console.log(new Date(2037, 10, 31));  // Novembar ima 30 dana i JS automatski prebacuje na 1. decembar

console.log(new Date(0));  // 1. jan 1970 1:00:000
console.log(new Date(3 * 24 * 60 * 60 * 1000));  // 4. jan 1970 1:00:000


// Working with dates
const futrue = new Date(2037, 10, 19, 15, 23);
console.log(futrue);
console.log(futrue.getFullYear());  // 2037
console.log(futrue.getMonth());  // 10
console.log(futrue.getDate());  // 19
console.log(futrue.getDay());  // 4 - thursday
console.log(futrue.getHours());
console.log(futrue.getMinutes());
console.log(futrue.getSeconds());

console.log(futrue.toISOString());  // Ispisuje string po standardnom obliku

console.log(futrue.getTime());  // 2142253380000

console.log(new Date(2142253380000));  // Thu Nov 19 2037 15:23:00 GMT+0100 (Central European Standard Time)

console.log(Date.now());  // 1676288557802

futrue.setFullYear(2040);
console.log(futrue); // Sada je umjesto 2037 postavljeno 2040




// ---- Operations With Dates ----
const futrue = new Date(2037, 10, 19, 15, 23);
console.log(Number(futrue));
console.log(+futrue);

// Funkcija za oduzimanje jednog datuma od drugog i dobijanje razlike u danima
const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 24), new Date(2037, 3, 14));
console.log(days1);




// ---- Internationalizing Numbers (Intl) ----
const num = 3855356.23;

const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: false
}

// Formatiranje broj u americkom stilu
console.log(new Intl.NumberFormat('en-US', options).format(num));

console.log(new Intl.NumberFormat('de-DE', options).format(num)); // Formatiranje na njemacki nacin, standardni evropski nacin 3.878.334,23

//console.log(new Intl.NumberFormat('ar-SY').format(num)); // Na sirijski

console.log(new Intl.NumberFormat(navigator.language, options).format(num));




// ---- Timers: setTimeout and setInterval ----

setTimeout(() => console.log('Here is your pizza!'), 3000); // Ispisace se recenica nakon 3 sekunde
console.log('Waiting...'); // Ovo ce se ispisati odmah


// Olivies i spinach su ulazni argumenti funkcije, i oni se kod setTimeout() funkcije definisu ovako jer se ova funkija ne poziva kao obicne funkcije
//setTimeout((el1, el2) => console.log(`Here is your pizza with ${el1} and ${el2}!`), 4000, 'olives', 'spinach');


const ingreadients = ['olives', 'spinach'];
const pizzaTimer = setTimeout((el1, el2) => console.log(`Here is your pizza with ${el1} and ${el2}!`), 4000, ...ingreadients);

if (ingreadients.includes('spinach')) clearTimeout(pizzaTimer);


setInterval
setInterval(function(){  // Funkcija se ivrsava svake sekunde
  const now = new Date();
  console.log(now);
}, 1000)


setInterval(function(){  
  const now = new Date();
  console.log(now.getSeconds());
}, 1000)

let br = 0;
const count100 = function(){
  const time = setInterval(function(){

    if (br === 6) clearInterval(time)

    console.log(br++);


  }, 1000)
}

let vrijeme;

vrijeme = count100()

if (vrijeme) clearInterval(vrijeme)
*/
