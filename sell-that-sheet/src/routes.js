import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdBlurLinear,
  MdGTranslate,
} from "react-icons/md";
import { RiTranslate } from "react-icons/ri";
import { FaTag, FaTags } from "react-icons/fa";
import { FiTool } from "react-icons/fi";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import ParametersView from "views/admin/parameters";
import Profile from "views/admin/profile";
import DataTables from "views/admin/dataTables";
import RTL from "views/admin/rtl";

// Auth Imports
import SignInCentered from "views/auth/signIn";
import TranslationManagerView from "views/admin/translationManager";
import TagsManagerView from "views/admin/tagsManager";
import CategoryTagsManagerView from "views/admin/categoryTagsManager";
import CustomParameterManagerView from "views/admin/customParameterManager";
import BaselinkerProductTranslation from "views/admin/baselinkerProductTranslation";

const routes = [
  {
    name: "Opisywanie",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: MainDashboard,
  },
  {
    name: "Pakiety",
    layout: "/admin",
    path: "/nft-marketplace",
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: NFTMarketplace,
    secondary: true,
  },
  // {
  //   name: "Data Tables",
  //   layout: "/admin",
  //   icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
  //   path: "/data-tables",
  //   component: DataTables,
  // },
  // {
  //   name: "Profile",
  //   layout: "/admin",
  //   path: "/profile",
  //   icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
  //   component: Profile,
  // },
  {
    name: "Logowanie",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignInCentered,
  },
  {
    name: "Parametry",
    layout: "/admin",
    path: "/parameters",
    icon: <Icon as={MdBlurLinear} width="20px" height="20px" color="inherit" />,
    component: ParametersView,
  },
  {
    name: "Przykłady Tłumaczeń",
    layout: "/admin",
    path: "/translation-manager",
    icon: <Icon as={MdGTranslate} width="20px" height="20px" color="inherit" />,
    component: TranslationManagerView,
  },
  {
    name: "Własne Tagi",
    layout: "/admin",
    path: "/custom-tags",
    icon: <Icon as={FaTag} width="20px" height="20px" color="inherit" />,
    component: TagsManagerView,
  },
  {
    name: "Tagi Kategorii",
    layout: "/admin",
    path: "/category-tags",
    icon: <Icon as={FaTags} width="20px" height="20px" color="inherit" />,
    component: CategoryTagsManagerView,
  },
  {
    name: "Własne Parametry",
    layout: "/admin",
    path: "/custom-params",
    icon: <Icon as={FiTool} width="20px" height="20px" color="inherit" />,
    component: CustomParameterManagerView,
  },
  {
    name: "Tłumaczenie BL",
    layout: "/admin",
    path: "/baselinker-product-translation",
    icon: <Icon as={RiTranslate} width="20px" height="20px" color="inherit" />,
    component: BaselinkerProductTranslation,
  },
  // {
  //   name: "RTL Admin",
  //   layout: "/rtl",
  //   path: "/rtl-default",
  //   icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
  //   component: RTL,
  // },
];

export default routes;
