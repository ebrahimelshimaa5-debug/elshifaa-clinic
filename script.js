import { createClient } from 'https://jsdelivr.net'

const supabaseUrl = 'https://supabase.co'; 
const supabaseKey = 'sb_publishable_Lh_VOHfdnwLn2yX6_fSqpA_reR6LKQ2'; 

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('advancedAppointmentForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const pName = document.getElementById('patientName').value.trim();
            const pPhone = document.getElementById('patientPhone').value.trim();
            const pDOB = document.getElementById('patientDOB').value;
            const pAddress = document.getElementById('patientAddress').value.trim();

            const selectedDoctorId = document.getElementById('doctorSelect').value;
            const appDate = document.getElementById('appointmentDate').value;
            const appTime = document.getElementById('appointmentTime').value;
            const appPurpose = document.getElementById('appointmentPurpose').value.trim();

            try {
                // 1. Insert into PATIENT table
                const { data: patientData, error: patientError } = await supabase
                    .from('PATIENT')
                    .insert([
                        { name: pName, phone: pPhone, date_of_birth: pDOB, address: pAddress }
                    ])
                    .select(); 

                if (patientError) {
                    alert('Patient Table Error: ' + patientError.message);
                    return;
                }

                if (!patientData || patientData.length === 0) {
                    alert('Error: No patient data returned from server.');
                    return;
                }
                const generatedPatientId = patientData[0].patient_id;

                // 2. Insert into APPOINTMENT table
                const { data: appointmentData, error: appointmentError } = await supabase
                    .from('APPOINTMENT')
                    .insert([
                        { 
                            date: appDate, 
                            time: appTime, 
                            purpose: appPurpose, 
                            patient_id: generatedPatientId, 
                            doctor_id: parseInt(selectedDoctorId) 
                        }
                    ])
                    .select();

                if (appointmentError) {
                    alert('Appointment Table Error: ' + appointmentError.message);
                    return;
                }

                if (!appointmentData || appointmentData.length === 0) {
                    alert('Error: No appointment data returned from server.');
                    return;
                }
                const generatedAppointmentId = appointmentData[0].appointment_id;

                // 3. Insert into BILL table (1:1 Relation)
                const { error: billError } = await supabase
                    .from('BILL')
                    .insert([
                        { 
                            amount: 150.00, 
                            payment_status: 'Unpaid', 
                            appointment_id: generatedAppointmentId 
                        }
                    ]);

                if (billError) {
                    alert('Bill Table Error: ' + billError.message);
                    return;
                }

                alert('Success! Appointment booked and Bill generated successfully.');
                form.reset();

            } catch (error) {
                console.error('Unexpected Error:', error);
                alert('An unexpected system error occurred. Please try again.');
            }
        });
    }
});
