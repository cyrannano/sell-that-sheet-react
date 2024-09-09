import React, { useEffect, useState } from "react";
import { HotTable } from "@handsontable/react";
import 'handsontable/dist/handsontable.full.css';
import { matchCategory, getCategoryById, getCategoryParameters } from 'contexts/AuthContext';

const AuctionSetSheet = ({ categoryId }) => {
  const [data, setData] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [columns, setColumns] = useState(["A", "B", "C"]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData(categoryId);
    } else {
      // show placeholder data
      setColumns(['Column 1', 'Column 2', 'Column 3']);
      setData([
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ]);
    }
  }, [categoryId]);

  const fetchCategoryData = async (categoryId) => {
    try {
      const response = await getCategoryParameters(categoryId);
      const parameters = response.parameters;
      const headers = parameters.map(param => param.name);
      const initialData = [
        ...Array(10).keys()
      ].map(() => Array(headers.length).fill('')); // Initialize with empty data

      setColumns(headers);
      setData(initialData);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const handleChange = (changes, source) => {
    if (source === "loadData") {
      return;
    }
    if (source === "edit") {
      // Handle edit
      console.log("Edit:", changes);
    }
    console.log("Changes:", changes);
  };

  return (
    <HotTable
      data={data}
      colHeaders={columns}
      rowHeaders={true}
      width="100%"
      height="300px"
      stretchH="all"
      fillHandle={true}
      afterChange={handleChange}
      licenseKey="non-commercial-and-evaluation"
      afterAutofill={handleChange}
      autofill
    />
  );
}

export default AuctionSetSheet;
