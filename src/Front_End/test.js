// Initialize the event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCheckboxListeners);

// Initialize event listeners for all checkboxes
function initializeCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

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