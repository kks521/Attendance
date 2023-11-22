"use strict";

class Student {
  constructor(name) {
    this.name = name;
    this.programs = []; //학생이 참가한 프로그램들을 저장하는 array
  }

  // 학생이 참가한 프로그램을 추가하는 메소드
  addProgram(programName) {
    if (programName.trim() !== "") {
      this.programs.push({
        name: programName,
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

// 학생 출석을 표시하는 함수
function markAttendance() {
  const studentName = document.getElementById("studentName").value.trim();

  if (studentName === "") {
    alert("학생 이름을 입력해주세요!");
    return;
  }

  // 새로운 Student object 생성
  const student = new Student(studentName);
  const li = createStudentListItem(student);

  document.getElementById("attendanceList").appendChild(li);
  document.getElementById("studentName").value = "";
}

// 학생 목록 항목을 생성하는 함수
function createStudentListItem(student) {
  const li = document.createElement("li");
  const text = document.createTextNode(student.name);
  li.appendChild(text);

  addProgramsToStudent(li, student);

  return li;
}

// 학생에게 프로그램을 추가하는 함수
function addProgramsToStudent(li, student) {
  const programInputs = document.getElementsByClassName("programInput");
  let programidx = 0;
  for (let i = 0; i < programInputs.length; i++) {
    const programName = programInputs[i].value.trim();

    if (programName !== "") {
      // student object에 프로그램 추가
      student.addProgram(programName);
      // createCheckbox 함수 사용
      const checkbox = createCheckbox(li, student, programidx);
      li.appendChild(checkbox);
      programidx += 1;
    }
  }

  // addRemoveButton 함수 사용
  addRemoveButton(li, student);
}

// 체크박스를 생성하는 함수
function createCheckbox(li, student, programIndex) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `attendance-${li.firstChild.textContent}-${programIndex}`;

  checkbox.addEventListener("change", function () {
    // handleCheckboxChange 함수 사용
    handleCheckboxChange(this, student, programIndex, li);
  });

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.appendChild(
    document.createTextNode(student.programs[programIndex].name)
  );

  li.appendChild(label);
  li.appendChild(checkbox);

  return checkbox;
}

// 체크박스 상태의 변화를 처리하는 함수
function handleCheckboxChange(checkbox, student, programIndex, li) {
  student.markProgramAttendance(programIndex);
  const program = student.programs[programIndex];

  if (checkbox.checked) {
    // createTimeLabel 함수 사용
    const now = new Date();
    const timeLabel = createTimeLabel(program.name, now);
    li.appendChild(timeLabel);
  } else {
    // removeTimeLabel 함수 사용
    removeTimeLabel(li, program.name);
  }
}

// 시간 라벨을 생성하는 함수
function createTimeLabel(programName, time) {
  const timeLabel = document.createElement("span");
  timeLabel.textContent = ` - ${programName} 체크 시간: ${time.toLocaleTimeString()}`;
  timeLabel.id = `check-time${programName}`;
  timeLabel.classList.add("check-time");

  return timeLabel;
}

// 시간 라벨을 제거하는 함수
function removeTimeLabel(li, programName) {
  const timeLabel = li.querySelector(`#check-time${programName}`);

  if (timeLabel) {
    li.removeChild(timeLabel);
  }
}

// 제거 버튼을 추가하는 함수
function addRemoveButton(li, student) {
  const removeButton = document.createElement("button");
  removeButton.textContent = "x";
  removeButton.className = "removeButton";
  removeButton.addEventListener("click", function () {
    removeStudent(li, student);
  });

  li.appendChild(removeButton);
}

function removeStudent(li, student) {
  const list = document.getElementById("attendanceList");
  list.removeChild(li);
}
// 프로그램 입력 필드를 토글하는 함수
function toggleProgramInputs() {
  const programInputs = document.getElementById("programInputs");
  programInputs.style.display =
    programInputs.style.display === "none" ? "block" : "none";
}

// 프로그램 입력 필드를 추가하는 함수
function addProgramInput() {
  const programInputContainer = document.getElementById("programInputs");
  const newProgramInput = document.createElement("input");
  newProgramInput.type = "text";
  newProgramInput.className = "programInput";
  newProgramInput.placeholder = "프로그램 이름을 입력하세요";
  programInputContainer.appendChild(newProgramInput);
}
