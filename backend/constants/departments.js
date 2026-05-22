/**
 * Canonical department list for Sturum.
 * Grouped by faculty/school for signup search and validation.
 */

const DEPARTMENTS = [
  // Marine & Maritime
  { name: "Meteorology and Climate Change", category: "Marine & Maritime" },
  { name: "Marine Geology", category: "Marine & Maritime" },
  { name: "Marine Environmental and Pollution", category: "Marine & Maritime" },
  { name: "Marine Transport and Logistics", category: "Marine & Maritime" },
  { name: "Fisheries and Aquaculture", category: "Marine & Maritime" },
  { name: "Marine Economics and Finance", category: "Marine & Maritime" },
  { name: "Port Management", category: "Marine & Maritime" },
  { name: "Oceanography", category: "Marine & Maritime" },
  { name: "Maritime Law and Policy", category: "Marine & Maritime" },
  { name: "Coastal Zone Management", category: "Marine & Maritime" },
  { name: "Naval Architecture and Ship Design", category: "Marine & Maritime" },

  // Engineering
  { name: "Civil Engineering", category: "Engineering" },
  { name: "Mechanical Engineering", category: "Engineering" },
  { name: "Electrical and Electronic Engineering", category: "Engineering" },
  { name: "Chemical Engineering", category: "Engineering" },
  { name: "Petroleum Engineering", category: "Engineering" },
  { name: "Computer Engineering", category: "Engineering" },
  { name: "Aerospace Engineering", category: "Engineering" },
  { name: "Biomedical Engineering", category: "Engineering" },
  { name: "Industrial Engineering", category: "Engineering" },
  { name: "Environmental Engineering", category: "Engineering" },
  { name: "Agricultural Engineering", category: "Engineering" },

  // Computing & IT
  { name: "Computer Science", category: "Computing & IT" },
  { name: "Information Technology", category: "Computing & IT" },
  { name: "Software Engineering", category: "Computing & IT" },
  { name: "Data Science and Analytics", category: "Computing & IT" },
  { name: "Cybersecurity", category: "Computing & IT" },
  { name: "Information Systems", category: "Computing & IT" },
  { name: "Artificial Intelligence", category: "Computing & IT" },

  // Sciences
  { name: "Biology", category: "Sciences" },
  { name: "Chemistry", category: "Sciences" },
  { name: "Physics", category: "Sciences" },
  { name: "Mathematics", category: "Sciences" },
  { name: "Statistics", category: "Sciences" },
  { name: "Biochemistry", category: "Sciences" },
  { name: "Microbiology", category: "Sciences" },
  { name: "Geology", category: "Sciences" },
  { name: "Environmental Science", category: "Sciences" },
  { name: "Biotechnology", category: "Sciences" },

  // Business & Economics
  { name: "Business Administration", category: "Business & Economics" },
  { name: "Accounting", category: "Business & Economics" },
  { name: "Finance", category: "Business & Economics" },
  { name: "Economics", category: "Business & Economics" },
  { name: "Marketing", category: "Business & Economics" },
  { name: "Human Resource Management", category: "Business & Economics" },
  { name: "International Business", category: "Business & Economics" },
  { name: "Entrepreneurship", category: "Business & Economics" },
  { name: "Supply Chain Management", category: "Business & Economics" },

  // Health Sciences
  { name: "Medicine", category: "Health Sciences" },
  { name: "Nursing", category: "Health Sciences" },
  { name: "Pharmacy", category: "Health Sciences" },
  { name: "Public Health", category: "Health Sciences" },
  { name: "Dentistry", category: "Health Sciences" },
  { name: "Physiotherapy", category: "Health Sciences" },
  { name: "Medical Laboratory Science", category: "Health Sciences" },
  { name: "Nutrition and Dietetics", category: "Health Sciences" },

  // Law & Social Sciences
  { name: "Law", category: "Law & Social Sciences" },
  { name: "Political Science", category: "Law & Social Sciences" },
  { name: "International Relations", category: "Law & Social Sciences" },
  { name: "Sociology", category: "Law & Social Sciences" },
  { name: "Psychology", category: "Law & Social Sciences" },
  { name: "Criminology", category: "Law & Social Sciences" },
  { name: "Social Work", category: "Law & Social Sciences" },
  { name: "Anthropology", category: "Law & Social Sciences" },

  // Arts & Humanities
  { name: "English Language and Literature", category: "Arts & Humanities" },
  { name: "History", category: "Arts & Humanities" },
  { name: "Philosophy", category: "Arts & Humanities" },
  { name: "Fine Arts", category: "Arts & Humanities" },
  { name: "Music", category: "Arts & Humanities" },
  { name: "Theatre Arts", category: "Arts & Humanities" },
  { name: "Mass Communication", category: "Arts & Humanities" },
  { name: "Linguistics", category: "Arts & Humanities" },
  { name: "French", category: "Arts & Humanities" },
  { name: "Arabic Studies", category: "Arts & Humanities" },

  // Agriculture & Environment
  { name: "Agriculture", category: "Agriculture & Environment" },
  { name: "Forestry", category: "Agriculture & Environment" },
  { name: "Wildlife Management", category: "Agriculture & Environment" },
  { name: "Food Science and Technology", category: "Agriculture & Environment" },
  { name: "Soil Science", category: "Agriculture & Environment" },

  // Education
  { name: "Education", category: "Education" },
  { name: "Educational Administration", category: "Education" },
  { name: "Guidance and Counselling", category: "Education" },
  { name: "Early Childhood Education", category: "Education" },

  // Architecture & Planning
  { name: "Architecture", category: "Architecture & Planning" },
  { name: "Urban and Regional Planning", category: "Architecture & Planning" },
  { name: "Quantity Surveying", category: "Architecture & Planning" },
  { name: "Estate Management", category: "Architecture & Planning" },
];

const DEPARTMENT_NAMES = new Set(DEPARTMENTS.map((d) => d.name));

const isValidDepartment = (name) => {
  if (!name || typeof name !== "string") return false;
  return DEPARTMENT_NAMES.has(name);
};

const normalizeDepartment = (name) => name;

const searchDepartments = (query = "") => {
  const q = query.trim().toLowerCase();
  if (!q) return DEPARTMENTS;

  return DEPARTMENTS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
  );
};

const getCategories = () => [...new Set(DEPARTMENTS.map((d) => d.category))].sort();

module.exports = {
  DEPARTMENTS,
  DEPARTMENT_NAMES,
  isValidDepartment,
  normalizeDepartment,
  searchDepartments,
  getCategories,
};
