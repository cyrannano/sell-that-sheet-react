import { Box, Flex, Stack, IconButton, Icon } from "@chakra-ui/react";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";

import Brand from "components/sidebar/components/Brand";
import Links from "components/sidebar/components/Links";
import React from "react";

function SidebarContent({ routes, isCollapsed, toggleSidebar }) {
  return (
    <Flex
      direction="column"
      height="100%"
      pt="25px"
      px="16px"
      borderRadius="30px"
    >
      {/* Brand (Hide Text if Collapsed) */}
      <Flex justify="flex-end" p="2">
        <IconButton
          icon={<Icon as={isCollapsed ? IoMenuOutline : IoCloseOutline} />}
          onClick={toggleSidebar}
          size="sm"
          aria-label="Toggle Sidebar"
        />
      </Flex>
      <Brand isCollapsed={isCollapsed} />

      {/* Navigation Links */}
      <Stack direction="column" mb="auto" mt="8px">
        <Box
          ps={isCollapsed ? "10px" : "20px"}
          pe={{ md: "16px", "2xl": "1px" }}
        >
          <Links routes={routes} isCollapsed={isCollapsed} />
        </Box>
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
