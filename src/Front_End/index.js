let previousCode = null;

function processValues(valuesArray) {
    valuesArray.forEach(className => {
        const elements = document.getElementsByClassName(className);
        for (let element of elements) {
            element.style.backgroundColor = "red";
            element.innerHTML = '';
        }
    });
    hideLoadingScreen();
}

showLoadingScreen();
let currentWeekCode = getCurrentWeekCode();
fetchReservations(currentWeekCode).then(reservations => {
    //proccess the reservations and change the UI
    console.log("week code: " + currentWeekCode)
    weekName.innerHTML = formatWeekCode(currentWeekCode);
    processValues(reservations);
});



const calendar = document.getElementsByClassName("calendar")[0];
const nextWeekButton = document.getElementsByClassName("nextweek")[0];
const previousWeekButton = document.getElementsByClassName("previousweek")[0];
const weekName = document.getElementsByClassName("week_name")[0];
const court1 = document.getElementsByClassName("button")[0];
const court2 = document.getElementsByClassName("button")[1];
const child1 = court1.querySelector("p");
const child2 = court2.querySelector("p");
let court = true;

court1.addEventListener("click", function() {
    showLoadingScreen();
    court = true;
    court2.classList.remove("court-select");
    child2.classList.remove("text-select");
    court1.classList.add("court-select");
    child1.classList.add("text-select");
    console.log(court);
    fetch('preset.html')
    .then(response => response.text())
    .then(data => {
        fetchReservations(currentWeekCode).then(reservations => {
            //proccess the reservations and change the UI
            calendar.innerHTML = data;
            weekName.innerHTML = formatWeekCode(currentWeekCode);
            initializeCheckboxListeners();
            processValues(reservations);
        });
    })
    .catch(error => console.error('Error loading preset.html:', error));

})

court2.addEventListener("click", function() {
    showLoadingScreen();
    court = false;
    court1.classList.remove("court-select");
    child1.classList.remove("text-select");
    court2.classList.add("court-select");
    child2.classList.add("text-select");
    console.log(court)
    fetch('preset.html')
    .then(response => response.text())
    .then(data => {
        fetchReservations2(currentWeekCode).then(reservations => {
            //proccess the reservations and change the UI
            calendar.innerHTML = data;
            weekName.innerHTML = formatWeekCode(currentWeekCode);
            initializeCheckboxListeners();
            processValues(reservations);
        });
    })
    .catch(error => console.error('Error loading preset.html:', error));

})



nextWeekButton.addEventListener("click", function() {
    fetch('preset.html')
        .then(response => response.text())
        .then(data => {
            showLoadingScreen();
            let newWeekCode = generateNextWeekCode(currentWeekCode);
            currentWeekCode = newWeekCode;
            if (court) {
                fetchReservations(newWeekCode).then(reservations => {
                    //proccess the reservations and change the UI
                    calendar.innerHTML = data;
                    weekName.innerHTML = formatWeekCode(newWeekCode);
                    initializeCheckboxListeners();
                    processValues(reservations);
                    console.log("next week button pressed with new week code: " + newWeekCode)
                });
            }else if (!court){
                fetchReservations2(newWeekCode).then(reservations => {
                    //proccess the reservations and change the UI
                    calendar.innerHTML = data;
                    weekName.innerHTML = formatWeekCode(newWeekCode);
                    initializeCheckboxListeners();
                    processValues(reservations);
                    console.log("next week button pressed with new week code2: " + newWeekCode)
                });
            }
            
        })
        .catch(error => console.error('Error loading preset.html:', error));
    
});


// Function to handle the checkbox change event
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const div = checkbox.closest('.col-3');

    if (checkbox.checked) {
        div.classList.add('checked');
    } else {
        div.classList.remove('checked');
    }
}

// Initialize event listeners for all checkboxes
function initializeCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}



previousWeekButton.addEventListener("click", function() {
    fetch('preset.html')
        .then(response => response.text())
        .then(data => {
            showLoadingScreen();
            let prevWeekCode = generatePreviousWeekCode(currentWeekCode);
            currentWeekCode = prevWeekCode;
            fetchReservations(prevWeekCode).then(reservations => {
                //proccess the reservations and change the UI
                calendar.innerHTML = data;
                weekName.innerHTML = formatWeekCode(prevWeekCode);
                initializeCheckboxListeners();
                processValues(reservations);
                console.log("previous week button pressed with new week code: " + prevWeekCode)
            });
        })
        .catch(error => console.error('Error loading preset.html:', error));
        
});

// Initialize the event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCheckboxListeners();  // Run the checkbox listeners initialization
});








//week generation 

function getCurrentWeekCode() {
    const today = new Date();

    // Calculate the start of the current week (assuming week starts on Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Adjust to Monday

    // Calculate the end of the current week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Extract the year, month, and day for the current week's start and end dates
    const year = String(startOfWeek.getFullYear()).slice(2); // Get last two digits of the year
    const month = String(startOfWeek.getMonth() + 1).padStart(2, '0'); // Month of the start date
    const startDay = String(startOfWeek.getDate()).padStart(2, '0');
    const endDay = String(endOfWeek.getDate()).padStart(2, '0');

    // Generate the current week code using the month of the start date
    const currentWeekCode = `W${year}-${month}-${startDay}-${endDay}`;

    return currentWeekCode;
}










function generateNextWeekCode(currentWeekCode) {
    let [year, month, startDay, endDay] = currentWeekCode.slice(1).split('-');

    year = parseInt(year);
    month = parseInt(month);
    startDay = parseInt(startDay);
    endDay = parseInt(endDay);

    // Calculate the start date of the next week
    let startDate = new Date(`20${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`);
    let nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 7);

    // Calculate the end date of the next week
    let nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextStartDate.getDate() + 6);

    // Extract the year, month, and day for the next week's start and end dates
    let nextYear = String(nextStartDate.getFullYear()).slice(2);
    let nextMonth = String(nextStartDate.getMonth() + 1).padStart(2, '0'); // Month of the next week's start date
    let nextStartDay = String(nextStartDate.getDate()).padStart(2, '0');
    let nextEndDay = String(nextEndDate.getDate()).padStart(2, '0');

    // Generate the next week code using the month of the next week's start date
    let nextWeekCode = `W${nextYear}-${nextMonth}-${nextStartDay}-${nextEndDay}`;

    return nextWeekCode;
}


function generatePreviousWeekCode(currentWeekCode) {
    let [year, month, startDay, endDay] = currentWeekCode.slice(1).split('-');

    year = parseInt(year);
    month = parseInt(month);
    startDay = parseInt(startDay);
    endDay = parseInt(endDay);

    // Calculate the start date of the previous week
    let startDate = new Date(`20${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`);
    let previousStartDate = new Date(startDate);
    previousStartDate.setDate(startDate.getDate() - 7);

    // Calculate the end date of the previous week
    let previousEndDate = new Date(previousStartDate);
    previousEndDate.setDate(previousStartDate.getDate() + 6);

    // Extract the year, month, and day for the previous week's start and end dates
    let previousYear = String(previousStartDate.getFullYear()).slice(2);
    let previousMonth = String(previousStartDate.getMonth() + 1).padStart(2, '0'); // Month of the previous week's start date
    let previousStartDay = String(previousStartDate.getDate()).padStart(2, '0');
    let previousEndDay = String(previousEndDate.getDate()).padStart(2, '0');

    // Generate the previous week code using the month of the previous week's start date
    let previousWeekCode = `W${previousYear}-${previousMonth}-${previousStartDay}-${previousEndDay}`;

    return previousWeekCode;
}





// Function to fetch reservations based on the given week code
async function fetchReservations(weekCode) {
    try {
        const response = await fetch('/checkWeekCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ weekCode: weekCode })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const reservations = data.reserved; // Extract the 'reserved' array from the data

        if (reservations) {
            console.log('Reservations for the week:', reservations);
            // You can now use the `reservations` array in your logic
        } else {
            console.log('No reservations found.');
        }

        return reservations;
    } catch (error) {
        console.error('Error:', error);
        return null; // Return null in case of an error
    }
}




// Function to fetch reservations based on the given week code
async function fetchReservations2(weekCode) {
    try {
        const response = await fetch('/checkWeekCode2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ weekCode: weekCode })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const reservations = data.reserved; // Extract the 'reserved' array from the data

        if (reservations) {
            console.log('Reservations for the week:', reservations);
            // You can now use the `reservations` array in your logic
        } else {
            console.log('No reservations found.');
        }

        return reservations;
    } catch (error) {
        console.error('Error:', error);
        return null; // Return null in case of an error
    }
}





function formatWeekCode(weekCode) {
    let [year, month, startDay, endDay] = weekCode.slice(1).split('-');

    // Convert month number to month name
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    let monthName = monthNames[parseInt(month) - 1]; // Convert month number to name

    // Format the string
    let formattedString = `${monthName} week of ${startDay}-${endDay}`;

    return formattedString;
}

function showLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'flex';
}
function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
}