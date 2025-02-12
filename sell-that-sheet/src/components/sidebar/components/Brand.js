import React from "react";

// Chakra imports
import { Flex, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand(props) {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");
  const { isCollapsed } = props;

  return (
    <Flex align='center' direction='column'>
      <inline style={{fontSize: (isCollapsed) ? '100%' : '42px'}}><strong>MPD</strong>Parts</inline>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
