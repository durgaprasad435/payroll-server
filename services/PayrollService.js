const uuid = require("uuid");
require("dotenv").config();
const Address = require("../models/address");
const Employee = require("../models/employee");
const Employer = require("../models/employer");
const Leave = require("../models/leave");
const Payroll = require("../models/payroll");
const Salary = require("../models/salary");
const Register = require("../models/register");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);
const nodemailer = require("nodemailer");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "Gmail", // Or use another email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});
async function sendPayslipEmail(toEmail, subject, message, pdfBlob, fromEmail) {
  try {
    // Try sending email with the dynamic fromEmail (from the frontend)
    await sendEmail(toEmail, subject, message, pdfBlob, fromEmail);
  } catch (error) {
    console.error(`Error sending email with fromEmail (${fromEmail}):`, error);

    // Fallback: Send email with the default noreply email if the dynamic one fails
   
    await sendEmail(toEmail, subject, message, pdfBlob, process.env.EMAIL_USER);
  }
}
// Helper function to send email
async function sendEmail(toEmail, subject, message, pdfBlob, fromEmail) {
  const mailOptions = {
    from: fromEmail, // Use the dynamic fromEmail or fallback email
    to: toEmail, // Employee email
    subject: subject,
    text: message,
    replyTo: fromEmail,
    attachments: [
      {
        filename: pdfBlob.originalname, // Original filename for the PDF
        content: pdfBlob.buffer, // PDF as a buffer
        contentType: "application/pdf", // Content type set to PDF
      },
    ],
  };
  // Send the email using nodemailer
  const info = await transporter.sendMail(mailOptions);
 
}
async function RegisterInfo(uname, email, password, role) {
  // Check if the user already exists
  const existingUser = await Register.findOne({ UserName: uname });

  if (existingUser) {
    return { status: "fail", message: "User already exists" };
  }

  // If email is verified, register the user with a token
  if (email) {
    const token = jwt.sign(
      { UserName: uname, role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "20m" }
    );
  }

  // Otherwise, create a new user record in the database
  const registerObj = {
    id: uuid.v4(),
    UserName: uname,
    EMail: email,
    Password: password, // Password is already hashed in the controller
    role: role, // Store the role (admin/employee)
    date_created: new Date(),
  };

  const data = await Register.create(registerObj);
  return {
    status: "success",
    UserName: data.UserName,
    role: data.role,
    email: data.EMail,
    message: "Registration successful",
  };
}

async function LoginInfo(username) {
  const userDoc = await Register.findOne({ UserName: username });

  if (!userDoc) {
    return {
      status: "fail",
      message: "Invalid username or password",
    };
  }

  // Return the user's details for token generation
  return {
    status: "success",
    UserName: userDoc.UserName,
    role: userDoc.role, // Include the role (admin/employee)
    Password: userDoc.Password, // Return the hashed password to compare in the controller
  };
}
async function addAddress(options) {
  const {
    employeeId,
    addressType,
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    state,
    country,
    zipCode,
  } = options;
  const addressObj = {
    employeeId,
    addressType,
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    state,
    country,
    zipCode,
  };
  var existingAddress = await Address.findOne({ employeeId });
  
  if (existingAddress) {
    // Update the existing document
    await Address.updateOne(
      { employeeId },
      {
        $set: {
          ...addressObj,
        },
      }
    );
   
    return await GetAllAddresses(); // Return the updated document or any relevant data
  } else {
    // Create a new document
    addressObj.id = uuid.v4();
    addressObj.addressId = uuid.v4(); // Generate a new ID only for new documents
    try {
      const newAddress = await Address.create(addressObj);

      return await GetAllAddresses();
    } catch (error) {
      console.error("Error creating address:", error);
    }
  }
}
async function addEmployee(
  firstName,
  lastName,
  gender,
  dateOfBirth,
  mobileNumber,
  email,
  employeeId,
  designation,
  employeeCode,
  joinDate,
  pan,
  aadhar,
  accountNumber,
  bankName,
  ifscCode,
  uan,
  pfNo,
  id
) {
  var doc = await Employee.findOne({ id: id });

  var employeeObj = null;
  if (doc == null) {
    employeeObj = {
      id: uuid.v4(),
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      dateOfBirth: dateOfBirth,
      mobileNumber: mobileNumber,
      email: email,
      employeeId: employeeId,
      designation: designation,
      employeeCode: employeeCode,
      joinDate: joinDate,
      pan: pan,
      aadhar: aadhar,
      accountNumber: accountNumber,
      bankName: bankName,
      ifscCode: ifscCode,
      uan: uan,
      pfNo: pfNo,
      createdDate: new Date(),
    };
    var data = await Employee.create(employeeObj);
  } else {
    (doc.firstName = firstName),
      (doc.lastName = lastName),
      (doc.gender = gender),
      (doc.dateOfBirth = dateOfBirth),
      (doc.mobileNumber = mobileNumber),
      (doc.email = email),
      (doc.employeeId = employeeId),
      (doc.designation = designation),
      (doc.employeeCode = employeeCode),
      (doc.joinDate = joinDate),
      (doc.pan = pan),
      (doc.aadhar = aadhar),
      (doc.accountNumber = accountNumber),
      (doc.bankName = bankName),
      (doc.ifscCode = ifscCode),
      (doc.uan = uan),
      (doc.pfNo = pfNo),
      (doc.modifiedDate = new Date());
    var result = await doc.save();
  }

  return await GetAllEmployees();
}
// Utility function to convert string to Date
const parseDate = (dateString) => {
  // Assuming the date format is "DD/MM/YYYY"
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}`); // Convert to Date object
};
async function bulkaddressesdata(options) {
  const addressDocs = [];
  for (const address of options) {
    const {
      employeeId,
      addressType,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      state,
      country,
      zipCode,
    } = address;
    try {
      const formattedEmployeeId = String(employeeId);
      // Check if the employee already exists by ID
      const doc = await Address.findOne({ employeeId: formattedEmployeeId });
      if (!doc) {
        const addressObj = {
          id: uuid.v4(),
          addressId: uuid.v4(),
          employeeId: formattedEmployeeId,
          addressType: addressType,
          addressLine1: addressLine1,
          addressLine2: addressLine2,
          addressLine3: addressLine3,
          city: city,
          state: state,
          country: country,
          zipCode: zipCode,
        };
        addressDocs.push(addressObj);
      } else {
        const updateAddress = {
          employeeId: formattedEmployeeId,
          addressType: addressType,
          addressLine1: addressLine1,
          addressLine2: addressLine2,
          addressLine3: addressLine3,
          city: city,
          state: state,
          country: country,
          zipCode: zipCode,
        };
        await Address.updateOne(
          { employeeId: formattedEmployeeId },
          { $set: updateAddress }
        );
      }
    } catch (error) {
      console.error(
        `Error processing employee with ID ${employeeId}:`,
        error.message
      );
    }
  }
  // Perform bulk insertion for new employees
  if (addressDocs.length > 0) {
    try {
      await Address.insertMany(addressDocs);
     
    } catch (insertError) {
      console.error("Error inserting new Addresses:", insertError.message);
    }
  } else {
    console.error("No new Addresses to insert.");
  }

  return await GetAllAddresses();
}
async function bulkempdata(employees) {
  const employeeDocs = [];

  for (const employee of employees) {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      mobileNumber,
      email,
      employeeId,
      designation,
      employeeCode,
      joinDate,
      pan,
      aadhar,
      accountNumber,
      bankName,
      ifscCode,
      uan,
      pfNo,
    } = employee;

    try {
      // Check if the employee already exists by employeeId
      const doc = await Employee.findOne({ employeeId: employeeId });
      const parsedDateOfBirth = parseDate(dateOfBirth); // Convert string to Date
      const parsedJoinDate = parseDate(joinDate); // Convert string to Date

      if (!doc) {
        // Create new employee object
        const employeeObj = {
          id: uuid.v4(),
          firstName,
          lastName,
          gender,
          dateOfBirth: parsedDateOfBirth, // Use converted date
          mobileNumber,
          email,
          employeeId,
          designation,
          employeeCode,
          joinDate: parsedJoinDate, // Use converted date
          pan,
          aadhar,
          accountNumber,
          bankName,
          ifscCode,
          uan,
          pfNo,
          createdDate: new Date(),
        };
        employeeDocs.push(employeeObj);
      } else {
        // Update existing employee record with new values
        const updatedEmployee = {
          firstName,
          lastName,
          gender,
          dateOfBirth: parsedDateOfBirth, // Use converted date
          mobileNumber,
          email,
          designation,
          employeeCode,
          joinDate: parsedJoinDate, // Use converted date
          pan,
          aadhar,
          accountNumber,
          bankName,
          ifscCode,
          uan,
          pfNo,
          modifiedDate: new Date(),
        };

        await Employee.updateOne(
          { employeeId: employeeId },
          { $set: updatedEmployee }
        );
        
      }
    } catch (error) {
      console.error(
        `Error processing employee with ID ${employeeId}:`,
        error.message
      );
    }
  }

  // Perform bulk insertion for new employees
  if (employeeDocs.length > 0) {
    try {
      await Employee.insertMany(employeeDocs);
      
    } catch (insertError) {
      console.error("Error inserting new employees:", insertError.message);
    }
  } else {
    console.error("No new employees to insert.");
  }

  return await GetAllEmployees(); // Fetch all employees after the operation
}

async function bulksalariesdata(salaries) {
  const salaryDocs = [];
  for (const salary of salaries) {
    const {
      employeeId,
      employeeName,
      basic,
      hra,
      medical,
      bonus,
      convinenceAllowance,
      communicationAllowance,
      epf,
      pf,
      netSalary,
      grossSalary,
      ctc,
      salaryStatus,
      ...rest // Handle any dynamic fields here
    } = salary;

    try {
      // Ensure employeeId is consistently treated as a string
      const formattedEmployeeId = String(employeeId);

      // Check if the employee already exists by ID
      const doc = await Salary.findOne({ employeeId: formattedEmployeeId });
      if (!doc) {
        // Create new employee object
        const salaryObj = {
          id: uuid.v4(),
          employeeId: formattedEmployeeId, // Use the parsed employeeId
          employeeName,
          basic: Number(basic) || 0, // Convert to number if needed
          hra: Number(hra) || 0,
          medical: Number(medical) || 0,
          bonus: Number(bonus) || 0,
          convinenceAllowance: Number(convinenceAllowance) || 0,
          communicationAllowance: Number(communicationAllowance) || 0,
          epf: Number(epf) || 0,
          pf: Number(pf) || 0,
          netSalary: Number(netSalary) || 0,
          grossSalary: Number(grossSalary) || 0,
          ctc: Number(ctc) || 0,
          salaryStatus,
          createdDate: new Date(),
          ...rest, // Handle dynamic fields
        };
        salaryDocs.push(salaryObj);
      } else {
        // Update existing employee record with new values
        const updatedSalary = {
          employeeName,
          basic: Number(basic) || 0,
          hra: Number(hra) || 0,
          medical: Number(medical) || 0,
          bonus: Number(bonus) || 0,
          convinenceAllowance: Number(convinenceAllowance) || 0,
          communicationAllowance: Number(communicationAllowance) || 0,
          epf: Number(epf) || 0,
          pf: Number(pf) || 0,
          netSalary: Number(netSalary) || 0,
          grossSalary: Number(grossSalary) || 0,
          ctc: Number(ctc) || 0,
          salaryStatus,
          modifiedDate: new Date(),
          ...rest, // Handle dynamic fields
        };

        await Salary.updateOne(
          { employeeId: formattedEmployeeId },
          { $set: updatedSalary }
        );
      }
    } catch (error) {
      console.error(
        `Error processing employee with ID ${employeeId}:`,
        error.message
      );
    }
  }

  // Perform bulk insertion for new employees
  if (salaryDocs.length > 0) {
    try {
      await Salary.insertMany(salaryDocs);
    } catch (insertError) {
      console.error("Error inserting new salaries:", insertError.message);
    }
  } else {
    console.error("No new salaries to insert.");
  }

  return await getEmployeesSalaryDetails(); // Fetch salary details after the operation
}

async function addEmployer(
  employerName,
  companyName,
  address,
  employeeCount,
  url,
  logo,
  employeerEmail
) {
  var employerObj = {
    id: uuid.v4(),
    employerName: employerName,
    companyName: companyName,
    address: address,
    employeeCount: employeeCount,
    url: url,
    logo: logo,
    employerEmail: employeerEmail,
  };
  var data = await Employer.create(employerObj);
  return data;
}
async function addLeave(
  employeeId,
  appliedDate,
  leaveDates,
  noOfDays,
  reason,
  status,
  approvedBy
) {
  //var doc=await Leave.findOne({employeeId:employeeId});
  var leaveObj = {
    id: uuid.v4(),
    employeeId: employeeId,
    appliedDate: appliedDate,
    leaveDates: leaveDates,
    noOfDays: noOfDays,
    reason: reason,
    status: "Pending",
    approvedBy: approvedBy,
    createdDate: new Date(),
  };
  var data = await Leave.create(leaveObj);
  return data;
}

async function addSalary(options) {
  try {
    const {
      employeeId,
      employeeName,
      basic,
      hra,
      medical,
      bonus,
      convinenceAllowance,
      communicationAllowance,
      epf,
      pf,
      netSalary,
      grossSalary,
      ctc,
      salaryStatus,
      ...rest // Rest of the dynamic fields
    } = options;

    const salaryObj = {
      employeeId,
      employeeName,
      basic,
      hra,
      medical,
      bonus,
      convinenceAllowance,
      communicationAllowance,
      epf,
      pf,
      netSalary,
      grossSalary,
      ctc,
      salaryStatus,
      ...rest, // Add dynamic fields
    };

    // Check if the document already exists
    const existingSalary = await Salary.findOne({ employeeId });

    if (existingSalary) {
      // Update the existing document
      await Salary.updateOne(
        { employeeId },
        {
          $set: {
            ...salaryObj,
            modifiedDate: new Date(), // Add modifiedDate on update
          },
        }
      );
      
      return await getEmployeesSalaryDetails(); // Return the updated document or any relevant data
    } else {
      // Create a new document
      salaryObj.id = uuid.v4();
      (salaryObj.createdDate = new Date()), // Generate a new ID only for new documents
        (newSalary = await Salary.create(salaryObj));
     
      return await getEmployeesSalaryDetails();
    }
  } catch (error) {
    console.error("Error in addSalary:", error);
    throw new Error("Could not add or update salary");
  }
}

async function addPayroll(
  employeeId,
  payMonth,
  basic,
  HRA,
  medical,
  bonus,
  convinenceAllowance,
  communicationAllowance,
  EPF,
  employerPF,
  otherComponent1,
  otherComponent2,
  grossTax,
  cess,
  netTax,
  professionalTax,
  payDate
) {
  //var doc= Payroll.findOne({employeeId:employeeId});
  var payrollObj = {
    id: uuid.v4(),
    employeeId: employeeId,
    payMonth: payMonth,
    basic: basic,
    HRA: HRA,
    medical: medical,
    bonus: bonus,
    convinenceAllowance: convinenceAllowance,
    communicationAllowance: communicationAllowance,
    EPF: EPF,
    employerPF: employerPF,
    otherComponent1: otherComponent1,
    otherComponent2: otherComponent2,
    grossTax: grossTax,
    cess: cess,
    netTax: netTax,
    professionalTax: professionalTax,
    payDate: payDate,
  };
  var data = await Payroll.create(payrollObj);
  return data;
}
async function updateEmployee(id, name, UAN) {
  var doc = await Employee.findOne({ id: id });
  //Updated values need to map with corresponding properties
  doc.name = name;
  doc.UAN = UAN;
  doc.modifiedDate = new Date();
  await doc.save();
  return await GetAllEmployees();
}
async function updateLeave(employeeId) {
  var doc = await Leave.findOne({ employeeId: employeeId });
  //Updated values need to map with corresponding properties
  doc.modifiedDate = new Date();
  await doc.save();
  return await GetAllLeaves();
}
async function updateSalary(employeeId) {
  var doc = await Salary.findOne({ employeeId: employeeId });
  //Updated values need to map with corresponding properties
  doc.modifiedDate = new Date();
  await doc.save();
}
async function updateStatusForAll(status) {
  await Salary.updateMany({}, { salaryStatus: status });
  return getEmployeesSalaryDetails();
}

async function getSalaryByEmpId(employeeId) {
  var data = await Salary.findOne({ employeeId: employeeId });
  if (data == null) return {};
  return data;
}
async function getEmployeesSalaryDetails() {
  var data = await Salary.find().sort({ employeeId: 1 });
  return data;
}
async function GetAllEmployees() {
  var data = await Employee.find().sort({ createdDate: 1 });
  return data;
}
async function GetAllLeaves() {
  var data = await Leave.find().sort({ createdDate: -1 });
  return data;
}
async function GetEmployeerDetails() {
  var data = await Employer.find();
  return data;
}
async function GetAllAddresses() {
  var data = await Address.find();
  return data;
}
async function DeleteEmployee(id) {
  var data = await Employee.deleteOne({ id: id });
  return await GetAllEmployees();
}
async function DeleteAllEmployees() {
  await Employee.deleteMany({});
  return;
}
module.exports = {
  sendPayslipEmail,
  RegisterInfo,
  LoginInfo,
  addAddress,
  addEmployee,
  addEmployer,
  addLeave,
  addSalary,
  addPayroll,
  updateEmployee,
  updateLeave,
  updateSalary,
  getSalaryByEmpId,
  getEmployeesSalaryDetails,
  GetAllEmployees,
  GetAllLeaves,
  GetEmployeerDetails,
  DeleteEmployee,
  DeleteAllEmployees,
  GetAllAddresses,
  bulkempdata,
  bulksalariesdata,
  bulkaddressesdata,
  updateStatusForAll,
};
