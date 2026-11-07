// Function to handle custom image upload dynamically from user device
document.getElementById('image-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('display-image').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Patient Registration Form Submission Handling
document.getElementById('patient-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const patientName = document.getElementById('patient-name').value;
    alert(`Thank you, ${patientName}! Your registration at El-Shifaa Specialized Clinic has been successfully submitted.`);
    this.reset();
});
