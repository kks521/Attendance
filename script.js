"use strict";

class Student {
  constructor(name) {
    this.name = name;
    this.programs = []; // 학생이 참가한 프로그램들을 저장하는 배열
    // 출석 이벤트 로그 기록
    logEvent(`${this.name} attended class`);
  }

  // 학생이 참가한 프로그램을 추가하는 메소드
  addProgram(programName) {
    const trimmedName = programName.trim();
    if (trimmedName !== "") {
      this.programs.push({
        name: trimmedName,
        checked: false,
        checkTime: null,
      });
    }
  }

  // 학생의 특정 프로그램의 출석을 표시하는 메소드
  markProgramAttendance(programIndex) {
    if (programIndex >= 0 && programIndex < this.programs.length) {
      const program = this.programs[programIndex];
      program.checked = true;
      program.checkTime = new Date();
    }
  }

  // 학생이 참가한 프로그램 목록에서 특정 프로그램 제거하는 메소드
  removeProgram(programIndex) {
    if (programIndex >= 0 && programIndex < this.programs.length) {
      this.programs.splice(programIndex, 1);
    }
  }

  // 학생의 이름과 참여한 프로그램 목록을 객체 형태로 반환하는 메소드
  getAttendanceInfo() {
    return {
      name: this.name,
      programs: this.programs,
    };
  }
}

// 학생 이름 입력 필드에서 엔터키 입력 감지
const handleKeyPress = (event) => {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault(); // 기본 동작 방지
    event.stopPropagation(); // 이벤트 전파 중지
    markAttendance();
    return false; // 추가적인 이벤트 처리 방지
  }
};

// 학생 출석을 표시하는 함수
const markAttendance = () => {
  const studentNameInput = document.getElementById("studentName");
  const studentName = studentNameInput.value.trim();

  if (studentName === "") {
    alert("학생 이름을 입력해주세요!");
    return;
  }

  // 새로운 Student 객체 생성
  const student = new Student(studentName);
  const li = createStudentListItem(student);

  document.getElementById("attendanceList").appendChild(li);
  studentNameInput.value = "";
  saveAttendanceToLocalStorage();
  updateTodaysAttendanceCount();
};

// 학생 목록 항목을 생성하는 함수
const createStudentListItem = (student) => {
  const li = document.createElement("li");
  const text = document.createTextNode(student.name);
  li.appendChild(text);

  addProgramsToStudent(li, student);

  return li;
};

// 학생에게 프로그램을 추가하는 함수
const addProgramsToStudent = (li, student) => {
  const programInputs = document.querySelectorAll(".programInput");
  let programIdx = 0;

  programInputs.forEach((input) => {
    const programName = input.value.trim();

    if (programName !== "") {
      // Student 객체에 프로그램 추가
      student.addProgram(programName);
      // createCheckbox 함수 사용
      const checkbox = createCheckbox(li, student, programIdx);
      li.appendChild(checkbox);
      programIdx += 1;
    }
  });

  // addRemoveButton 함수 사용
  addRemoveButton(li, student);
};

// 체크박스를 생성하는 함수
const createCheckbox = (li, student, programIndex) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `attendance-${student.name}-${programIndex}`;

  checkbox.addEventListener("change", () => {
    handleCheckboxChange(checkbox, student, programIndex, li);
  });

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = student.programs[programIndex].name;

  li.appendChild(label);
  li.appendChild(checkbox);

  return checkbox;
};

// 체크박스 상태의 변화를 처리하는 함수
const handleCheckboxChange = (checkbox, student, programIndex, li) => {
  student.markProgramAttendance(programIndex);
  const program = student.programs[programIndex];

  if (checkbox.checked) {
    // 프로그램 체크박스가 체크되었을 때 로그에 추가
    logEvent(`${student.name} attended ${program.name}`);
    const now = new Date();
    const timeLabel = createTimeLabel(program.name, now);
    li.appendChild(timeLabel);
  } else {
    // 시간 라벨 제거 함수 사용
    removeTimeLabel(li, program.name);
  }

  saveAttendanceToLocalStorage();
};

// 시간 라벨을 생성하는 함수
const createTimeLabel = (programName, time) => {
  const timeLabel = document.createElement("span");
  timeLabel.textContent = ` - ${programName} 체크 시간: ${time.toLocaleTimeString()}`;
  timeLabel.id = `check-time-${programName}`;
  timeLabel.classList.add("check-time");

  return timeLabel;
};

// 시간 라벨을 제거하는 함수
const removeTimeLabel = (li, programName) => {
  const timeLabel = li.querySelector(`#check-time-${programName}`);

  if (timeLabel) {
    li.removeChild(timeLabel);
  }
};

// 제거 버튼을 추가하는 함수
const addRemoveButton = (li, student) => {
  const removeButton = document.createElement("button");
  removeButton.textContent = "x";
  removeButton.className = "removeButton";

  removeButton.addEventListener("click", () => {
    removeStudent(li, student);
  });

  li.appendChild(removeButton);
};

// 학생을 목록에서 제거하는 함수
const removeStudent = (li, student) => {
  const list = document.getElementById("attendanceList");
  list.removeChild(li);
  saveAttendanceToLocalStorage();
  updateTodaysAttendanceCount();
};

// 프로그램 입력 필드를 토글하는 함수
const toggleProgramInputs = () => {
  const programInputs = document.getElementById("programInputs");
  programInputs.style.display =
    programInputs.style.display === "none" ? "block" : "none";
};

// 프로그램 입력 필드를 추가하는 함수
const addProgramInput = () => {
  const programInputContainer = document.getElementById("programInputs");
  const newProgramInput = document.createElement("input");
  newProgramInput.type = "text";
  newProgramInput.className = "programInput";
  newProgramInput.placeholder = "프로그램 이름을 입력하세요";
  programInputContainer.appendChild(newProgramInput);
};

// 전체 로그를 저장할 배열
let logArray = [];

// 로그 기록 함수
const logEvent = (event) => {
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp} - ${event}`;
  logArray.push(logEntry);
  updateLogDisplay();
  saveLogToLocalStorage();
};

// 전체 로그 조회 함수
const updateLogDisplay = () => {
  const logDisplay = document.getElementById("logDisplay");

  logDisplay.style.display = logVisible ? "block" : "none";

  logDisplay.innerHTML = "<h4>로그</h4>";

  logArray.forEach((logEntry, index) => {
    logDisplay.innerHTML += `<p>${index + 1}. ${logEntry}</p>`;
  });
};

// 로그 표시 여부를 나타내는 변수
let logVisible = true;

// 버튼 클릭 시 로그 표시/숨김 토글
const toggleLogDisplay = () => {
  logVisible = !logVisible;
  updateLogDisplay();
};

// 로컬 스토리지에 출석 데이터 저장
const saveAttendanceToLocalStorage = () => {
  const attendanceList = document.getElementById("attendanceList").innerHTML;
  localStorage.setItem("attendanceData", attendanceList);
};

// 로그 이벤트를 로컬 스토리지에 저장하는 함수
const saveLogToLocalStorage = () => {
  localStorage.setItem("logData", JSON.stringify(logArray));
};

// 로그 데이터 로드 함수
const loadLogFromLocalStorage = () => {
  const storedLog = localStorage.getItem("logData");
  if (storedLog) {
    logArray = JSON.parse(storedLog);
    updateLogDisplay();
  }
};

// 로컬 스토리지에서 출석 데이터 로드
const loadAttendanceFromLocalStorage = () => {
  const storedAttendance = localStorage.getItem("attendanceData");
  if (storedAttendance) {
    document.getElementById("attendanceList").innerHTML = storedAttendance;
  }
};

// 페이지가 로드될 때 데이터 로드 함수 호출
document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceFromLocalStorage(); // 출석 데이터 로드
  loadLogFromLocalStorage(); // 로그 데이터 로드

  // 학생 이름 입력 필드에 이벤트 리스너 추가
  const studentNameInput = document.getElementById("studentName");
  studentNameInput.addEventListener("keydown", handleKeyPress);
});

// 로컬 스토리지에 저장된 데이터 초기화
const resetAttendance = () => {
  const password = prompt("비밀번호를 입력하세요:");
  const correctPassword = "0521"; // 비밀번호 설정
  if (password === correctPassword) {
    document.getElementById("attendanceList").innerHTML = "";
    localStorage.removeItem("attendanceData");
    logArray = []; // 로그 배열 초기화
    saveLogToLocalStorage(); // 로컬 스토리지에 로그 데이터 저장
    updateLogDisplay();
    alert("데이터가 초기화되었습니다.");
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
};

// 메모 입력 필드를 토글하는 함수
const toggleMemoDisplay = () => {
  const memoElement = document.getElementById("memoInputs");
  memoElement.style.display =
    memoElement.style.display === "none" ? "block" : "none";
};

// 오늘의 출석 수를 가져오는 함수
const getTodaysAttendanceCount = () => {
  const attendanceList = document.getElementById("attendanceList");
  const studentItems = attendanceList.getElementsByTagName("li");
  return studentItems.length;
};

// 오늘의 출석 수를 업데이트하는 함수
const updateTodaysAttendanceCount = () => {
  const todaysAttendanceCount = getTodaysAttendanceCount();
  document.getElementById(
    "todaysAttendanceCount"
  ).textContent = `Today ${todaysAttendanceCount}`;
};
