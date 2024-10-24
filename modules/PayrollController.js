const express = require("express");
const router = express.Router();
const service = require("../services/PayrollService");
const {
  authenticateRequests,
  authorizeRole,
} = require("../middleware/authmiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Function to generate Access Token (expires in 15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
};

// Function to generate Refresh Token (expires in 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });
};
// Register route
router.post("/register", async (req, res, next) => {
  try {
    const { UserName, EMail, Password, Role } = req.body;

    // Hash the password before sending to service
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Call the RegisterInfo function from payrollservice
    const result = await service.RegisterInfo(
      UserName,
      EMail,
      hashedPassword,
      Role
    );

    if (result.status === "success") {
      const token = jwt.sign(
        { UserName: result.UserName, role: result.role },
        process.env.JWT_SECRET_KEY
      );

      res.cookie("Bearer", token, {
        maxAge: 900000, // 15 minutes
        secure: true,
        sameSite: "None",
      });

      res.status(201).send({
        status: "success",
        message: result.message,
        accessToken: token,
        role: result.role,
        email: result.email,
      });
    } else {
      res.status(400).send({ status: "fail", message: result.message });
    }
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handler)
  }
});

// Login route
router.post("/login", async (req, res, next) => {
  try {
    const { UserName, Password } = req.body;

    // Call the LoginInfo function from payrollservice
    const result = await service.LoginInfo(UserName);

    if (result.status === "success") {
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(Password, result.Password);

      if (isPasswordValid) {
        // Generate JWT token with user details
        const token = jwt.sign(
          { UserName: result.UserName, role: result.role },
          process.env.JWT_SECRET_KEY
        );

        res.cookie("accessToken", token, {
          maxAge: 900000, // 15 minutes
          secure: true,
          sameSite: "None",
        });

        res.status(200).send({
          status: "success",
          UserName: UserName,
          accessToken: token,
          role: result.role,
          message: "Login successful",
        });
      } else {
        res.status(401).send({ status: "fail", message: "Incorrect password" });
      }
    } else {
      res.status(404).send({ status: "fail", message: result.message });
    }
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handler)
  }
});
router.post(
  "/addaddress",
  authenticateRequests,
  authorizeRole(["admin", "employee"]),
  async (req, res, next) => {
    try {
      var address = await service.addAddress(req.body);
      res.send({
        status: "success",
        data: address,
        message: "Address uploaded successfully!",
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.post(
  "/addemployee",
  authenticateRequests,
  authorizeRole(["admin"]),
  async (req, res, next) => {
    try {
      var employee = await service.addEmployee(
        req.body.firstName,
        req.body.lastName,
        req.body.gender,
        req.body.dateOfBirth,
        req.body.mobileNumber,
        req.body.email,
        req.body.employeeId,
        req.body.designation,
        req.body.employeeCode,
        req.body.joinDate,
        req.body.pan,
        req.body.aadhar,
        req.body.accountNumber,
        req.body.bankName,
        req.body.ifscCode,
        req.body.uan,
        req.body.pfNo,
        req.body.id
      );
      res.send({
        status: "success",
        data: employee,
        message: "Employee details successfully uploaded!",
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.post("/bulkempdata", async (req, res, next) => {
  try {
    // Make sure req.body.jsonData is an array
    const employees = req.body.jsonData;

    if (!Array.isArray(employees)) {
      return res
        .status(400)
        .send({ status: "error", message: "Invalid data format" });
    }
    const result = await service.bulkempdata(employees);

    res.send({
      status: "success",
      data: result,
      message: "Employee details successfully uploaded!",
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.post("/bulksalariesdata", async (req, res, next) => {
  try {
    // Make sure req.body.jsonData is an array
    const salaries = req.body.jsonData;

    if (!Array.isArray(salaries)) {
      return res
        .status(400)
        .send({ status: "error", message: "Invalid data format" });
    }
    const result = await service.bulksalariesdata(salaries);

    res.send({
      status: "success",
      data: result,
      message: "Salaries details successfully uploaded!",
    });
  } catch (error) {
    console.error("Error in bulksalariesdata route:", error); // Log the actual error
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.post("/bulkaddressesdata", async (req, res, next) => {
  try {
    // Make sure req.body.jsonData is an array
    const addresses = req.body.jsonData;

    if (!Array.isArray(addresses)) {
      return res
        .status(400)
        .send({ status: "error", message: "Invalid data format" });
    }
    const result = await service.bulkaddressesdata(addresses);

    res.send({
      status: "success",
      data: result,
      message: "Employes addresses successfully uploaded!",
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.post("/updateStatusForAll", async (req, res) => {
  try {
    const { status } = req.body; // 'Paid' or 'UnPaid'
    const result = await service.updateStatusForAll(status);
    res.send({
      status: "success",
      data: result,
      message: "Employes salary status successfully updated!",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});
router.post("/addemployeer", async (req, res, next) => {
  try {
    var employer = await service.addEmployer(
      req.body.employerName,
      req.body.companyName,
      req.body.officeAddress,
      req.body.numberOfEmployees,
      req.body.companyUrl,
      req.body.companyLogo,
      req.body.employeerEmail
    );
    res.send({
      status: "success",
      data: employer,
      message: "Employer details successfully uploaded!",
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.get("/employeerdata", async (req, res, next) => {
  try {
    var employeerData = await service.GetEmployeerDetails();
    res.send({
      status: "success",
      data: employeerData,
      message: "Successfully fetched Employer details.",
    });
  } catch (err) {
    next(err);
  }
});
router.post(
  "/leave",
  authenticateRequests,
  authorizeRole(["admin", "employee"]),
  async (req, res, next) => {
    try {
      var leave = await service.addLeave(
        req.body.employeeId,
        req.body.appliedDate,
        req.body.leaveDates,
        req.body.noOfDays,
        req.body.reason,
        req.body.approvedBy
      );
      res.send({
        status: "success",
        data: leave,
        message: "Uploaded successfully!",
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.post(
  "/addsalary",
  authenticateRequests,
  authorizeRole(["admin"]),
  async (req, res, next) => {
    try {
      const salary = await service.addSalary(req.body);
      res.send({
        status: "success",
        data: salary,
        message: "Salary details uploaded successfully!",
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.post("/getemployeesalarybyid", async (req, res, next) => {
  try {
    var employeeId = req.body.employeeId;
    const salaryDetails = await service.getSalaryByEmpId(employeeId);
    res.send({
      status: "success",
      data: salaryDetails,
      message: "Successfully fetched salary details by Employee Id.",
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.get(
  "/allempsalaries",
  authenticateRequests,
  authorizeRole(["admin"]),
  async (req, res, next) => {
    try {
      var allSalaries = await service.getEmployeesSalaryDetails();
      res.send({
        status: "success",
        data: allSalaries,
        message: "Get all employees salary details successfully!",
      });
    } catch (err) {
      next(err);
    }
  }
);
router.post(
  "/addpayroll",
  authenticateRequests,
  authorizeRole(["admin"]),
  async (req, res, next) => {
    try {
      var payroll = await service.addPayroll(
        req.body.employeeId,
        req.body.basic,
        req.body.HRA,
        req.body.medical,
        req.body.bonus,
        req.body.convinenceAllowance,
        req.body.communicationAllowance,
        req.body.EPF,
        req.body.employerPF,
        req.body.otherComponent1,
        req.body.otherComponent2,
        req.body.grossTax,
        req.body.cess,
        req.body.netTax,
        req.body.professionalTax,
        req.body.payDate
      );
      res.send({ status: "success", data: payroll });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.post("/updateemployee", async (req, res, next) => {
  try {
    var updateEmployee = await service.updateEmployee(
      req.body.id,
      req.body.name,
      req.body.UAN
    );
    res.send({ status: "success", data: updateEmployee });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.post(
  "/updateleave",
  authenticateRequests,
  authorizeRole(["admin", "employee"]),
  async (req, res, next) => {
    try {
      var updateLeave = await service.updateLeave(req.body.employeeId);
      res.send({ status: "success", data: updateLeave });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.post("/updatesalary", async (req, res, next) => {
  try {
    var updateSalary = await service.updateSalary(req.body.employeeId);
    res.send({ status: "success" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});
router.post(
  "/deleteemployee",
  authenticateRequests,
  authorizeRole(["admin"]),
  async (req, res, next) => {
    try {
      var deleteEmployee = await service.DeleteEmployee(req.body.id);
      res.send({
        status: "success",
        data: deleteEmployee,
        message: "Employee details deleted successfully",
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.get(
  "/delallemployees",
  authenticateRequests,
  authorizeRole(["admin"]),
  async (req, res, next) => {
    try {
      var deleteEmployee = await service.DeleteAllEmployees();
      res.send({
        status: "success",
        data: [],
        message: "Successfully deleted employees details!",
      });
    } catch (error) {
      res.status(500).send({ status: "error", message: error.message });
    }
  }
);
router.get(
  "/allemployes",
  authenticateRequests,
  authorizeRole(["admin", "employee"]),
  async (req, res, next) => {
    try {
      var allEmployes = await service.GetAllEmployees();
      res.send({
        status: "success",
        data: allEmployes,
        message: "Get all employees details successfully!",
      });
    } catch (err) {
      next(err);
    }
  }
);
router.get("/allleaves", async (req, res, next) => {
  try {
    var allLeaves = await service.GetAllLeaves();
    res.send({
      status: "success",
      data: allLeaves,
      message: "Get all leaves details successfully!",
    });
  } catch (err) {
    next(err);
  }
});
router.get("/allempaddresses", async (req, res, next) => {
  try {
    var allAddresses = await service.GetAllAddresses();
    res.send({
      status: "success",
      data: allAddresses,
      message: "Get all addresses of employees successfully!",
    });
  } catch (err) {
    next(err);
  }
});
// Public route for sending payslip emails
router.post("/payslipemail", upload.single("pdf"), async (req, res) => {
  try {
    const { email, subject, message, fromEmail } = req.body;
    const pdfBlob = req.file;
    if (!pdfBlob) {
      return res
        .status(400)
        .send({ status: "error", message: "PDF file is missing" });
    }

    await service.sendPayslipEmail(email, subject, message, pdfBlob, fromEmail);
    res.send({ status: "success", message: "Email sent successfully" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});

module.exports = router;
