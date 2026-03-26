import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, getBranchId } from '../../lib/supabase';
import { formatCurrency, cn } from '../../lib/utils';
import { CheckCircle2, ChevronRight, ChevronLeft, Stethoscope, AlertCircle } from 'lucide-react';

const enrollmentSchema = z.object({
  // Step 1
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  
  // Step 2
  highest_qualification: z.string().min(2, 'Qualification is required'),
  background_type: z.enum(['life_science', 'non_science', 'healthcare_professional']),
  college_name: z.string().min(2, 'College name is required'),
  year_of_passing: z.string().min(4, 'Year is required'),
  
  // Step 3
  course_id: z.string().uuid('Please select a course'),
  batch_id: z.string().uuid('Please select a batch'),
  payment_mode: z.enum(['full', 'installment']),
  placement_consent: z.boolean().optional(),
  
  // Step 4
  declaration: z.boolean().refine(val => val === true, {
    message: 'You must accept the declaration',
  }),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Academic Background' },
  { id: 3, title: 'Course Selection' },
  { id: 4, title: 'Review & Submit' },
];

export default function Enroll() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      course_id: searchParams.get('course') || '',
      placement_consent: false,
    },
    mode: 'onChange'
  });

  const selectedCourseId = watch('course_id');
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('*').eq('is_active', true);
      if (data) setCourses(data);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const fetchBatches = async () => {
        const { data } = await supabase
          .from('batches')
          .select('*')
          .eq('course_id', selectedCourseId)
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString());
        if (data) setBatches(data);
      };
      fetchBatches();
      // Reset batch when course changes
      setValue('batch_id', '');
    } else {
      setBatches([]);
    }
  }, [selectedCourseId, setValue]);

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['full_name', 'email', 'phone', 'date_of_birth', 'gender', 'city', 'pincode'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['highest_qualification', 'background_type', 'college_name', 'year_of_passing'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['course_id', 'batch_id', 'payment_mode'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const branchId = await getBranchId();
      
      // 1. Check if email exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', data.email)
        .single();

      let studentId = existingStudent?.id;

      // 2. Insert or update student
      if (!studentId) {
        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            city: data.city,
            pincode: data.pincode,
            highest_qualification: data.highest_qualification,
            background_type: data.background_type,
            college_name: data.college_name,
            year_of_passing: data.year_of_passing,
            branch_id: branchId,
            enrollment_status: 'enquiry'
          })
          .select()
          .single();

        if (studentError) throw studentError;
        studentId = newStudent.id;
      }

      // 3. Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${studentId}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('student-documents')
          .upload(`resumes/${fileName}`, resumeFile);
          
        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          // Continue with enrollment even if resume upload fails
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('student-documents')
            .getPublicUrl(uploadData.path);
          resumeUrl = publicUrl;
        }
      }

      // 4. Create enrollment
      const course = courses.find(c => c.id === data.course_id);
      const totalFee = data.payment_mode === 'full' ? course.fee_full : (course.fee_installment_amount * course.fee_installment_count);

      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          batch_id: data.batch_id,
          branch_id: branchId,
          payment_mode: data.payment_mode,
          total_fee: totalFee,
          balance_due: totalFee,
          placement_consent: data.placement_consent,
          resume_url: resumeUrl,
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Redirect to success
      navigate(`/enroll/success?id=${enrollment.id}`);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      setSubmitError(error.message || 'An error occurred during enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-light z-0"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
            
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-colors",
                  currentStep > step.id ? "bg-primary border-primary text-white" :
                  currentStep === step.id ? "bg-white border-primary text-primary" :
                  "bg-white border-gray-light text-gray-400"
                )}>
                  {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
                </div>
                <span className={cn(
                  "absolute -bottom-6 text-xs font-medium whitespace-nowrap",
                  currentStep >= step.id ? "text-navy" : "text-gray-400"
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-light overflow-hidden">
          <div className="bg-navy text-white p-6 flex items-center gap-3">
            <Stethoscope size={24} className="text-primary-light" />
            <h2 className="font-display font-bold text-xl">Student Enrollment Application</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            
            {submitError && (
              <div className="mb-6 p-4 bg-danger/10 border-l-4 border-danger text-danger flex items-start gap-3 rounded-r">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b border-gray-light pb-2 mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Full Name *</label>
                    <input {...register('full_name')} className="clinical-input" placeholder="As per official records" />
                    {errors.full_name && <p className="text-danger text-xs mt-1">{errors.full_name.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Email Address *</label>
                    <input type="email" {...register('email')} className="clinical-input" placeholder="john@example.com" />
                    {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Phone Number *</label>
                    <input {...register('phone')} className="clinical-input" placeholder="10-digit mobile number" maxLength={10} />
                    {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Date of Birth *</label>
                    <input type="date" {...register('date_of_birth')} className="clinical-input" />
                    {errors.date_of_birth && <p className="text-danger text-xs mt-1">{errors.date_of_birth.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Gender *</label>
                    <select {...register('gender')} className="clinical-input bg-white">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.gender && <p className="text-danger text-xs mt-1">{errors.gender.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">City *</label>
                    <input {...register('city')} className="clinical-input" placeholder="e.g. Mangalore" />
                    {errors.city && <p className="text-danger text-xs mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Pincode *</label>
                    <input {...register('pincode')} className="clinical-input" placeholder="6 digits" maxLength={6} />
                    {errors.pincode && <p className="text-danger text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Background */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b border-gray-light pb-2 mb-6">Academic Background</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-3">Background Type *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['life_science', 'non_science', 'healthcare_professional'].map((type) => (
                        <label key={type} className="flex items-center p-4 border border-gray-light rounded-lg cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <input type="radio" value={type} {...register('background_type')} className="text-primary focus:ring-primary h-4 w-4" />
                          <span className="ml-3 text-sm font-medium text-navy capitalize">{type.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                    {errors.background_type && <p className="text-danger text-xs mt-1">{errors.background_type.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-mid mb-1">Highest Qualification *</label>
                      <input list="qualifications" {...register('highest_qualification')} className="clinical-input" placeholder="e.g. B.Sc Nursing" />
                      <datalist id="qualifications">
                        <option value="B.Sc Nursing" />
                        <option value="B.Pharm" />
                        <option value="MBBS" />
                        <option value="B.Com" />
                        <option value="BA" />
                        <option value="BPT" />
                        <option value="BMLT" />
                      </datalist>
                      {errors.highest_qualification && <p className="text-danger text-xs mt-1">{errors.highest_qualification.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-mid mb-1">College/University Name *</label>
                      <input list="colleges" {...register('college_name')} className="clinical-input" placeholder="Name of institution" />
                      <datalist id="colleges">
                        <option value="Yenepoya University" />
                        <option value="Father Muller College" />
                        <option value="AJ Institute of Medical Sciences" />
                        <option value="SDM College" />
                        <option value="Manipal Academy" />
                      </datalist>
                      {errors.college_name && <p className="text-danger text-xs mt-1">{errors.college_name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-mid mb-1">Year of Passing *</label>
                      <input type="number" {...register('year_of_passing')} className="clinical-input" placeholder="YYYY" min="1990" max={new Date().getFullYear() + 1} />
                      {errors.year_of_passing && <p className="text-danger text-xs mt-1">{errors.year_of_passing.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-mid mb-1">Upload Resume/CV (Optional)</label>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="clinical-input file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                      />
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Course Selection */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b border-gray-light pb-2 mb-6">Program Selection</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-3">Select Course *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
                      {courses.map((course) => (
                        <label key={course.id} className="flex flex-col p-4 border border-gray-light rounded-lg cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-display font-bold text-navy">{course.name}</span>
                            <input type="radio" value={course.id} {...register('course_id')} className="text-primary focus:ring-primary h-4 w-4 mt-1" />
                          </div>
                          <div className="text-xs text-gray-mid mb-2">{course.duration_weeks} Weeks</div>
                          <div className="text-sm font-medium text-primary mt-auto">{formatCurrency(course.fee_full)}</div>
                        </label>
                      ))}
                    </div>
                    {errors.course_id && <p className="text-danger text-xs mt-1">{errors.course_id.message}</p>}
                  </div>

                  {selectedCourseId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-accent rounded-lg border border-primary/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-mid mb-1">Select Batch *</label>
                        <select {...register('batch_id')} className="clinical-input bg-white rounded px-2">
                          <option value="">Choose available batch...</option>
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.batch_name} ({b.mode}, {b.schedule}) - Starts {new Date(b.start_date).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                        {errors.batch_id && <p className="text-danger text-xs mt-1">{errors.batch_id.message}</p>}
                        {batches.length === 0 && <p className="text-xs text-gray-mid mt-1">No active batches available for this course.</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-mid mb-1">Payment Preference *</label>
                        <select {...register('payment_mode')} className="clinical-input bg-white rounded px-2">
                          <option value="">Select payment mode</option>
                          <option value="full">Full Payment ({formatCurrency(selectedCourse?.fee_full || 0)})</option>
                          {selectedCourse?.fee_installment_count > 1 && (
                            <option value="installment">
                              Installments ({selectedCourse.fee_installment_count} x {formatCurrency(selectedCourse.fee_installment_amount)})
                            </option>
                          )}
                        </select>
                        {errors.payment_mode && <p className="text-danger text-xs mt-1">{errors.payment_mode.message}</p>}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-light">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register('placement_consent')} className="mt-1 text-primary focus:ring-primary rounded" />
                      <span className="text-sm text-gray-mid leading-relaxed">
                        <strong className="text-navy block mb-1">Placement Assistance Consent</strong>
                        I consent to MedCode Institute sharing my academic profile, resume, and contact details with prospective employers and placement partners for job opportunities.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b border-gray-light pb-2 mb-6">Review Application</h3>
                
                <div className="bg-accent p-6 rounded-lg space-y-6 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-mid mb-1">Applicant Name</p>
                      <p className="font-medium text-navy">{watch('full_name')}</p>
                    </div>
                    <div>
                      <p className="text-gray-mid mb-1">Contact</p>
                      <p className="font-medium text-navy">{watch('email')}<br/>{watch('phone')}</p>
                    </div>
                    <div>
                      <p className="text-gray-mid mb-1">Qualification</p>
                      <p className="font-medium text-navy">{watch('highest_qualification')} ({watch('year_of_passing')})</p>
                    </div>
                    <div>
                      <p className="text-gray-mid mb-1">Selected Program</p>
                      <p className="font-medium text-navy">{selectedCourse?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-mid mb-1">Payment Mode</p>
                      <p className="font-medium text-navy capitalize">{watch('payment_mode')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-primary/30 bg-primary/5 rounded-lg">
                    <input type="checkbox" {...register('declaration')} className="mt-1 text-primary focus:ring-primary rounded" />
                    <span className="text-sm text-navy leading-relaxed">
                      I hereby declare that all information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to cancellation of my enrollment.
                    </span>
                  </label>
                  {errors.declaration && <p className="text-danger text-xs mt-2 ml-8">{errors.declaration.message}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-light flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-2.5 text-navy font-medium hover:bg-accent rounded-md transition-colors"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
              ) : <div></div>}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-navy hover:bg-navy/90 text-white px-8 py-2.5 rounded-md font-medium transition-colors"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-8 py-2.5 rounded-md font-medium transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  {!isSubmitting && <CheckCircle2 size={18} />}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
