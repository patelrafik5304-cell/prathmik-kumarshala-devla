'use client';

export default function StudentProfile() {
  const student = {
    name: 'John Doe',
    rollNumber: 'STU001',
    class: '10-A',
    email: 'john@school.com',
    dateOfBirth: '2008-05-15',
    parentName: 'Mr. James Doe',
    contactNumber: '+1 234 567 890',
    address: '123 School Street, Education City',
    attendance: '94%',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 h-32" />
        <div className="px-8 pb-8">
          <div className="w-24 h-24 bg-indigo-600 rounded-full border-4 border-white -mt-12 flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">{student.name.charAt(0)}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500 mb-6">Roll No: {student.rollNumber} | Class: {student.class}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'Email', value: student.email },
              { label: 'Date of Birth', value: student.dateOfBirth },
              { label: 'Parent Name', value: student.parentName },
              { label: 'Contact', value: student.contactNumber },
              { label: 'Address', value: student.address },
              { label: 'Attendance', value: student.attendance },
            ].map((item, i) => (
              <div key={i} className="border-b pb-3">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="font-medium text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
