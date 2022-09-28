let report = document.getElementById("report-table");
const fileSelector = document.getElementById("file-selector");
const dataSelector = document.getElementById("data-selector");

let allJobs = [];

// function readTextFile(file)
// {
//   var rawFile = new XMLHttpRequest();
//   rawFile.open("GET", file, false);
//   rawFile.overrideMimeType('text\/plain; charset=x-user-defined');
//   rawFile.onreadystatechange = function () {
//     if(rawFile.readyState === 4) {
//       if(rawFile.status === 200 || rawFile.status == 0) {
//         var allText = rawFile.response;
//
//
//         var abyte = rawFile.responseText.charCodeAt(allText.length - 1) & 0xff;
//         console.log('ZZ ', abyte)
//         const workbook = XLSX.read(allText, {
//           type: 'binary'
//         });
//
//         allJobs.forEach((item) => {
//           const { failed: fails } = item;
//           fails.forEach((fail) => {
//             const lastWord = fail.split(' ').pop();
//             const [sheet, col] = lastWord.split('-');
//             // Here is your object
//             const XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[`Sheet${sheet}`], {header:1});
//             const json_object = JSON.stringify(XL_row_object);
//             const emailRow = JSON.parse(json_object)[0];
//             console.log(`${sheet}-${col}: ${emailRow[Number(col) + 1]}`)
//           })
//         })
//       }
//     }
//   }
//   rawFile.send(null);
// }

const buildReportTable = (data) => {
  if (data) {
    const row = data.map(
      ({ name, key = "", average = 0, passed = 0, countKeys }) => {
        return `<tr><td>${name}</td><td>${
          countKeys?.[countKeys.length - 1]
        }</td><td>${average}</td><td>${passed}</td></tr>`;
      }
    );
    const tableHtml = `<table>
      <tr>
        <th>Thread Group Name/Cases</th>
        <th>  </th>
        <th>Average (seconds)</th>
        <th>% passed</th>
      </tr>
      ${row}
    </table>`;
    const table = document.createElement("table");
    table.innerHTML = tableHtml;
    report.append(table);
  }
};

fileSelector.addEventListener("change", async (event) => {
  const fileList = event.target.files;
  console.log(fileList);
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = e.target.result;
    //    console.log('quoc anh ', data)
    const workbook = XLSX.read(data, {
      type: "binary",
    });

    workbook.SheetNames.forEach(function (sheetName) {
      // Here is your object
      const XL_row_object = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName]
      );
      const json_object = JSON.stringify(XL_row_object);

      if (sheetName === "ui") {
        const { data, jobs } = test(json_object, key_mapping["ui_2"]);
        buildReportTable(data);
        allJobs.push(jobs);
      } else {
        const { data, jobs } = test(json_object, key_mapping["api_2"]);
        buildReportTable(data);
        allJobs.push(jobs);
      }

      const { data, jobs } = test(json_object, key_mapping[sheetName]);
      buildReportTable(data);
      allJobs.push(jobs);
    });

    // read StudentData by default
    //readTextFile("API.xlsx");
  };

  reader.onerror = function (ex) {
    console.log(ex);
  };

  reader.readAsBinaryString(fileList[0]);
});

dataSelector.addEventListener("change", async (event) => {
  const dataFileList = event.target.files;
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, {
      type: "binary",
    });

    allJobs.forEach((item) => {
      const { failed: fails } = item;
      fails.forEach((fail) => {
        const lastWord = fail.split(" ").pop();
        const [sheet, col] = lastWord.split("-");
        // Here is your object
        const XL_row_object = XLSX.utils.sheet_to_json(
          workbook.Sheets[`Sheet${sheet}`],
          { header: 1 }
        );
        const json_object = JSON.stringify(XL_row_object);
        const emailRow = JSON.parse(json_object)[0];
        console.log(`${sheet}-${col}: ${emailRow[Number(col) + 1]}`);
      });
    });
  };

  reader.onerror = function (ex) {
    console.log(ex);
  };

  reader.readAsBinaryString(dataFileList[0]);
});
