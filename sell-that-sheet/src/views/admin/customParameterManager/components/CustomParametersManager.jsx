// CustomParametersManager.jsx
import React, { useState } from "react";
import { Box, Heading, Divider } from "@chakra-ui/react";
import AddCustomParameter from "./AddCustomParameter";
import ManageCustomParameters from "./ManageCustomParameters";

const CustomParametersManager = () => {
  const [refreshList, setRefreshList] = useState(false);

  const triggerRefresh = () => {
    // Toggle refresh state to force a re-fetch of parameters
    setRefreshList(!refreshList);
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Zarządzanie Parametrami</Heading>
      <AddCustomParameter onParameterAdded={triggerRefresh} />
      <Divider my={6} />
      <ManageCustomParameters refresh={refreshList} />
    </Box>
  );
};

export default CustomParametersManager;
