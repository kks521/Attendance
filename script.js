"use strict";

const defaultProgramsByDay = {
  0: ["피아노"], // 일요일
  1: ["탁구", "피아노"], // 월요일
  2: ["영어", "피아노"], // 화요일
  3: ["우쿠렐레", "독서지도", "피아노"], // 수요일
  4: ["영어", "피아노"], // 목요일
  5: ["음악지도", "피아노"], // 금요일
  6: [], // 토요일
};

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
      program.checkTime = new Date().toISOString();
    }
  }

  // 학생의 특정 프로그램의 출석 취소하는 메소드
  unmarkProgramAttendance(programIndex) {
    if (programIndex >= 0 && programIndex < this.programs.length) {
      const program = this.programs[programIndex];
      program.checked = false;
      program.checkTime = null;
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

  // 포커스를 다시 학생 이름 입력 필드로 이동
  studentNameInput.focus();
};

// 학생 목록 항목을 생성하는 함수
const createStudentListItem = (student) => {
  const li = document.createElement("li");
  li.dataset.name = student.name; // 데이터 속성에 이름 저장
  const text = document.createTextNode(student.name);
  li.appendChild(text);

  addProgramsToStudent(li, student);

  return li;
};

// 학생에게 프로그램을 추가하는 함수
const addProgramsToStudent = (li, student) => {
  if (student.programs.length === 0) {
    // 새로운 학생일 경우, 프로그램 입력 필드에서 프로그램 추가
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
  } else {
    // 로컬 스토리지에서 로드한 경우, student.programs 사용
    student.programs.forEach((program, index) => {
      const checkbox = createCheckbox(li, student, index);
      li.appendChild(checkbox);
    });
  }

  // 제거 버튼 추가
  addRemoveButton(li, student);
};

// 체크박스를 생성하는 함수
const createCheckbox = (li, student, programIndex) => {
  const program = student.programs[programIndex];
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `attendance-${student.name}-${programIndex}`;
  checkbox.dataset.programName = program.name; // 프로그램 이름 저장

  checkbox.addEventListener("change", () => {
    handleCheckboxChange(checkbox, student, programIndex, li);
  });

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = program.name;

  li.appendChild(label);
  li.appendChild(checkbox);

  return checkbox;
};

// 체크박스 상태의 변화를 처리하는 함수
const handleCheckboxChange = (checkbox, student, programIndex, li) => {
  const program = student.programs[programIndex];
  if (checkbox.checked) {
    student.markProgramAttendance(programIndex);
    // 프로그램 체크박스가 체크되었을 때 로그에 추가
    logEvent(`${student.name} attended ${program.name}`);
    const checkTime = new Date(program.checkTime);
    const timeLabel = createTimeLabel(student.name, program.name, checkTime);
    li.appendChild(timeLabel);
  } else {
    student.unmarkProgramAttendance(programIndex);
    // 시간 라벨 제거 함수 사용
    removeTimeLabel(li, student.name, program.name);
  }

  saveAttendanceToLocalStorage();
};

// 시간 라벨을 생성하는 함수
const createTimeLabel = (studentName, programName, time) => {
  const timeLabel = document.createElement("span");
  timeLabel.textContent = ` - ${programName} 체크 시간: ${time.toLocaleTimeString()}`;
  timeLabel.id = `check-time-${studentName}-${programName}`;
  timeLabel.classList.add("check-time");
  timeLabel.dataset.time = time.toISOString(); // 시간 데이터를 데이터 속성에 저장

  return timeLabel;
};

// 시간 라벨을 제거하는 함수
const removeTimeLabel = (li, studentName, programName) => {
  const timeLabel = li.querySelector(
    `#check-time-${studentName}-${programName}`
  );

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

// 현재 요일에 해당하는 프로그램 입력 필드 자동 채우기
const populateProgramInputs = () => {
  const programInputContainer = document.getElementById("programInputs");
  programInputContainer.innerHTML = ""; // 기존 입력 필드 초기화

  const today = new Date().getDay(); // 0 (일요일)부터 6 (토요일)까지의 숫자를 반환
  const programsForToday = defaultProgramsByDay[today] || [];

  // 프로그램 입력 필드 생성
  programsForToday.forEach((programName) => {
    const newProgramInput = document.createElement("input");
    newProgramInput.type = "text";
    newProgramInput.className = "programInput";
    newProgramInput.value = programName; // 기본 프로그램 이름 설정
    programInputContainer.appendChild(newProgramInput);
  });
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
  const attendanceList = [];

  const studentItems = document.querySelectorAll("#attendanceList li");

  studentItems.forEach((li) => {
    const studentName = li.dataset.name;
    const programs = [];

    const checkboxes = li.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => {
      const programName = checkbox.dataset.programName;
      const checked = checkbox.checked;
      const checkTimeLabel = li.querySelector(
        `#check-time-${studentName}-${programName}`
      );
      const checkTime = checkTimeLabel ? checkTimeLabel.dataset.time : null;

      programs.push({
        name: programName,
        checked: checked,
        checkTime: checkTime,
      });
    });

    attendanceList.push({
      name: studentName,
      programs: programs,
    });
  });

  localStorage.setItem("attendanceData", JSON.stringify(attendanceList));
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
    const attendanceListData = JSON.parse(storedAttendance);
    const attendanceList = document.getElementById("attendanceList");
    attendanceList.innerHTML = ""; // 기존 리스트 초기화

    attendanceListData.forEach((studentData) => {
      const student = new Student(studentData.name);
      student.programs = studentData.programs;

      const li = createStudentListItem(student);

      // 프로그램 체크 상태와 시간 라벨을 복원
      student.programs.forEach((program, index) => {
        const checkbox = li.querySelector(
          `#attendance-${student.name}-${index}`
        );
        if (checkbox) {
          checkbox.checked = program.checked;
        }

        if (program.checked && program.checkTime) {
          const timeLabel = createTimeLabel(
            student.name,
            program.name,
            new Date(program.checkTime)
          );
          li.appendChild(timeLabel);
        }
      });

      attendanceList.appendChild(li);
    });
  }
  updateTodaysAttendanceCount(); // 출석 수 업데이트
};

// 페이지가 로드될 때 데이터 로드 함수 호출
document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceFromLocalStorage(); // 출석 데이터 로드
  loadLogFromLocalStorage(); // 로그 데이터 로드

  // 학생 이름 입력 필드에 이벤트 리스너 추가
  const studentNameInput = document.getElementById("studentName");
  studentNameInput.addEventListener("keydown", handleKeyPress); // 'keyup'에서 'keydown'으로 변경

  populateProgramInputs(); // 프로그램 입력 필드 자동 채우기
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
