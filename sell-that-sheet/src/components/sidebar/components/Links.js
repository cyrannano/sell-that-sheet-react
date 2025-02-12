import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, Flex, HStack, Text, useColorModeValue, Tooltip } from "@chakra-ui/react";

export function SidebarLinks({ routes, isCollapsed }) {
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue("secondaryGray.600", "secondaryGray.600");
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  const activeRoute = (routeName) => location.pathname.includes(routeName);

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.category) {
        return (
          !isCollapsed && (
            <Text
              fontSize="md"
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{ sm: "10px", xl: "16px" }}
              pt="18px"
              pb="12px"
              key={index}
            >
              {route.name}
            </Text>
          )
        );
      } else if (["/admin", "/auth", "/rtl"].includes(route.layout)) {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            <Box>
              <HStack
                spacing={isCollapsed ? "0" : activeRoute(route.path.toLowerCase()) ? "22px" : "26px"}
                py="5px"
                ps={isCollapsed ? "0" : "10px"}
                justifyContent={isCollapsed ? "center" : "flex-start"}
              >
                <Tooltip label={isCollapsed ? route.name : ""} placement="right">
                  <Flex alignItems="center">
                    <Box
                      color={activeRoute(route.path.toLowerCase()) ? activeIcon : textColor}
                      me={isCollapsed ? "0" : "18px"}
                      fontSize="20px"
                    >
                      {route.icon}
                    </Box>
                    {!isCollapsed && (
                      <Text
                        me="auto"
                        color={activeRoute(route.path.toLowerCase()) ? activeColor : textColor}
                        fontWeight={activeRoute(route.path.toLowerCase()) ? "bold" : "normal"}
                      >
                        {route.name}
                      </Text>
                    )}
                  </Flex>
                </Tooltip>
                {!isCollapsed && (
                  <Box
                    h="36px"
                    w="4px"
                    bg={activeRoute(route.path.toLowerCase()) ? brandColor : "transparent"}
                    borderRadius="5px"
                  />
                )}
              </HStack>
            </Box>
          </NavLink>
        );
      }
    });
  };

  return createLinks(routes);
}

export default SidebarLinks;
