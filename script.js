const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHskY_LMtoF4GSer-rUOzw_0NfvDHs8';

async function insertToSupabase(table, data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed inserting into ${table}: ${error.message}`);
    }
}

async function seedDoctors() {
    const doctorsList = [
        { doctor_id: 'DOC01', name: 'Dr. Mary Abdullah', specialization: 'Pediatrics', email: 'mary@shifaclinic.com' },
        { doctor_id: 'DOC02', name: 'Dr. Lilian Ahmed', specialization: 'Obstetrics & Gynecology', email: 'lilian@shifaclinic.com' },
        { doctor_id: 'DOC03', name: 'Dr. Ahmed Mahmoud', specialization: 'Internal Medicine', email: 'ahmed@shifaclinic.com' }
    ];
    for (const doc of doctorsList) {
        try { await insertToSupabase('doctors', doc); } catch(e) { }
    }
}

document.getElementById('patient-form').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    await seedDoctors();

    const patientId = document.getElementById('patient-id').value;
    const appointmentId = document.getElementById('appointment-id').value;
    const billId = document.getElementById('bill-id').value;

    const patientEntity = {
        patient_id: patientId,
        name: document.getElementById('patient-name').value,
        date_of_birth: document.getElementById('patient-dob').value,
        phone: document.getElementById('patient-phone').value,
        address: document.getElementById('patient-address').value
    };

    const appointmentEntity = {
        appointment_id: appointmentId,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        purpose: document.getElementById('purpose').value,
        patient_id: patientId,
        doctor_id: document.getElementById('doctor-select').value
    };

    const billEntity = {
        bill_id: billId,
        date_issued: document.getElementById('appointment-date').value, 
        amount: parseFloat(document.getElementById('bill-amount').value),
        payment_status: document.getElementById('payment-status').value,
        appointment_id: appointmentId
    };

    try {
        await insertToSupabase('patients', patientEntity);
        await insertToSupabase('appointments', appointmentEntity);
        await insertToSupabase('bills', billEntity);

        alert(`🌸 Transaction Complete!\nPatient, Appointment, and Bill records have been successfully linked and saved in Supabase Database!`);
        this.reset();
    } catch (error) {
        console.error(error);
        alert('An error occurred during submission. Please verify your unique IDs and try again.');
    }
});

document.getElementById('image-upload').addEventListener('change', function(event) {
    const file = event.target.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('display-image').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});
