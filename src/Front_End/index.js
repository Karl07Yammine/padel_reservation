const values = ['SU1330', "M1000", "W1000", "W1030", "W1100"];
const values2 = ['SU1300', "T1000", "F1000", "F1030", "F1100"];

function processValues(valuesArray) {
    valuesArray.forEach(className => {
        const elements = document.getElementsByClassName(className);
        for (let element of elements) {
            element.style.backgroundColor = "red";
            element.innerHTML = '';
        }
    });
}

processValues(values);


const nextWeekButton = document.getElementsByClassName("nextweek")[0];
    const calendar = document.getElementsByClassName("calendar")[0];

    nextWeekButton.addEventListener("click", function() {
        fetch('preset.html')
            .then(response => response.text())
            .then(data => {
                calendar.innerHTML = data;
                initializeCheckboxListeners();
                processValues(values2)
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

// Initialize the event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCheckboxListeners);