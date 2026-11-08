import { createClient } from 'https://jsdelivr.net'

// ⚠️ ضعي الروابط والمفاتيح الثابتة الخاصة بمشروعك هنا بين القوسين:
const supabaseUrl = 'https://supabase.co'; 
const supabaseKey = 'sb_publishable_Lh_VOHfdnwLn2yX6_fSqpA_reR6LKQ2'; 

export const supabase = createClient(supabaseUrl, supabaseKey);

// الانتظار حتى تحميل عناصر الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('advancedAppointmentForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // منع إعادة تحميل الصفحة

            // 1. جلب قيم الحقول الطبية والشخصية من الاستمارة
            const pName = document.getElementById('patientName').value.trim();
            const pPhone = document.getElementById('patientPhone').value.trim();
            const pDOB = document.getElementById('patientDOB').value;
            const pAddress = document.getElementById('patientAddress').value.trim();

            const selectedDoctorId = document.getElementById('doctorSelect').value;
            const appDate = document.getElementById('appointmentDate').value;
            const appTime = document.getElementById('appointmentTime').value;
            const appPurpose = document.getElementById('appointmentPurpose').value.trim();

            try {
                // الخطوة أ: إدخال بيانات المريض في جدول PATIENT وجلب الـ ID الخاص به تلقائياً
                const { data: patientData, error: patientError } = await supabase
                    .from('PATIENT')
                    .insert([
                        { name: pName, phone: pPhone, date_of_birth: pDOB, address: pAddress }
                    ])
                    .select('patient_id')
                    .single();

                if (patientError) throw new Error('خطأ أثناء تسجيل بيانات المريض: ' + patientError.message);
                const generatedPatientId = patientData.patient_id;

                // الخطوة ب: استخدام الـ patient_id لإنشاء الحجز في جدول APPOINTMENT
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
                    .select('appointment_id')
                    .single();

                if (appointmentError) throw new Error('خطأ أثناء إنشاء الموعد الطبي: ' + appointmentError.message);
                const generatedAppointmentId = appointmentData.appointment_id;

                // الخطوة ج: توليد الفاتورة التلقائية المرتبطة بالحجز في جدول BILL (العلاقة 1:1)
                const { error: billError } = await supabase
                    .from('BILL')
                    .insert([
                        { 
                            amount: 150.00, // قيمة الكشف الافتراضية بالعيادة
                            payment_status: 'Unpaid', // الحالة الافتراضية غير مدفوع لحين السداد
                            appointment_id: generatedAppointmentId 
                        }
                    ]);

                if (billError) throw new Error('خطأ أثناء توليد الفاتورة المالية للزيارة: ' + billError.message);

                // إذا تمت العمليات الثلاث المترابطة بنجاح كامل بدون توقف
                alert('🎉 ممتاز! تم تسجيل المريض، وتأكيد الحجز بنجاح، وإصدار الفاتورة في النظام بملفاتك الثابتة!');
                form.reset();

            } catch (error) {
                console.error('❌ فشل النظام في معالجة الحجز المترابط:', error.message);
                alert('حدث خطأ في الشبكة أو البيانات: ' + error.message);
            }
        });
    }
});
