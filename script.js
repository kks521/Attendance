"use strict";

// 학생 출석을 표시하는 함수
function markAttendance() {
  const studentName = document.getElementById("studentName").value;

  if (studentName === "") {
    alert("학생 이름을 입력해주세요!");
    return;
  }

  // createStudentListItem 함수 사용
  const li = createStudentListItem(studentName);
  addProgramsToStudent(li);

  document.getElementById("attendanceList").appendChild(li);
  document.getElementById("studentName").value = "";
}

// 학생 목록 항목을 생성하는 함수
function createStudentListItem(studentName) {
  const li = document.createElement("li");
  const text = document.createTextNode(studentName);
  li.appendChild(text);

  return li;
}

// 학생에게 프로그램을 추가하는 함수
function addProgramsToStudent(li) {
  const programInputs = document.getElementsByClassName("programInput");

  for (let i = 0; i < programInputs.length; i++) {
    const programName = programInputs[i].value;

    if (programName !== "") {
      // createCheckbox 함수 사용
      const checkbox = createCheckbox(li, programName, i);
      li.appendChild(checkbox);
    }
  }

  // addRemoveButton 함수 사용
  addRemoveButton(li);
}

// 체크박스를 생성하는 함수
function createCheckbox(li, programName, index) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `attendance-${li.firstChild.textContent}-${index}`;

  checkbox.addEventListener("change", function () {
    // handleCheckboxChange 함수 사용
    handleCheckboxChange(this, programName, li);
  });

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(programName));

  li.appendChild(label);
  li.appendChild(checkbox);

  return checkbox;
}

// 체크박스 상태의 변화를 처리하는 함수
function handleCheckboxChange(checkbox, programName, li) {
  const timeLabel = li.querySelector(`#check-time${programName}`);

  if (checkbox.checked) {
    // createTimeLabel 함수 사용
    const now = new Date();
    const timeLabel = createTimeLabel(programName, now);
    li.appendChild(timeLabel);
  } else {
    // removeTimeLabel 함수 사용
    removeTimeLabel(li, timeLabel);
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
function removeTimeLabel(li, timeLabel) {
  if (timeLabel) {
    li.removeChild(timeLabel);
  }
}

// 제거 버튼을 추가하는 함수
function addRemoveButton(li) {
  const removeButton = document.createElement("button");
  removeButton.textContent = "x";
  removeButton.className = "removeButton";
  removeButton.addEventListener("click", function () {
    li.remove();
  });

  li.appendChild(removeButton);
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
