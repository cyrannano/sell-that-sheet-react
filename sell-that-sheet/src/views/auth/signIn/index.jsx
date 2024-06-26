/* eslint-disable */
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import { Formik, Form, Field } from "formik";
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useAuth } from "contexts/AuthContext";
import { useHistory } from "react-router-dom";

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "gray.200" },
    { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
  );
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  const { login, checkAuth, isAuthenticated } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [error, setError] = React.useState(false);
  const history = useHistory();
  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password).then((data) => {
      setError(false);
    }).catch((error) => {
      // validate the error and show a message to the user
      setError(true); 
    });
  }

  useEffect(() => {
    if (isAuthenticated) {
      history.push("/admin");
    }

  }, [isAuthenticated]);
  
  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        mx={{ base: "auto", lg: "0px" }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            Sign In
          </Heading>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            Enter your username and password to sign in!
          </Text>
        </Box>
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: "100%", md: "420px" }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: "auto", lg: "unset" }}
          me='auto'
          mb={{ base: "20px", md: "auto" }}>
          {/* <Button
            fontSize='sm'
            me='0px'
            mb='26px'
            py='15px'
            h='50px'
            borderRadius='16px'
            bg={googleBg}
            color={googleText}
            fontWeight='500'
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}>
            <Icon as={FcGoogle} w='20px' h='20px' me='10px' />
            Sign in with Google
          </Button> */}
          {/* <Flex align='center' mb='25px'>
            <HSeparator />
            <Text color='gray.400' mx='14px'>
              or
            </Text>
            <HSeparator />
          </Flex> */}
          <Formik
            onSubmit={(values, actions) => {
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2))
                actions.setSubmitting(false)
              }, 1000)
            }}
          >
          {(props) => (
            <Form onSubmit={handleLogin}>
              <Field name="username" validate={error}>
              {({ field, form }) => (
                <FormControl isInvalid={error}>
                  <FormLabel
                    display='flex'
                    ms='4px'
                    fontSize='sm'
                    fontWeight='500'
                    color={textColor}
                    mb='8px'>
                    Username<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    {...field}
                    isRequired={true}
                    // variant='auth'
                    fontSize='sm'
                    ms={{ base: "0px", md: "0px" }}
                    type='username'
                    placeholder='user123'
                    mb='24px'
                    fontWeight='500'
                    size='lg'
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  </FormControl>
              )}
                  </Field>
                  <Field>
                    {({ field, form }) => (
                  <FormControl isInvalid={error}>
                  <FormLabel
                    ms='4px'
                    fontSize='sm'
                    fontWeight='500'
                    color={textColor}
                    display='flex'>
                    Password<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup size='md'>
                    <Input
                      {...field}
                      isRequired={true}
                      fontSize='sm'
                      placeholder='Min. 8 characters'
                      mb='24px'
                      size='lg'
                      type={show ? "text" : "password"}
                      // variant='auth'
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement display='flex' alignItems='center' mt='4px'>
                      <Icon
                        color={textColorSecondary}
                        _hover={{ cursor: "pointer" }}
                        as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                        onClick={handleClick}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {/* <Flex justifyContent='space-between' align='center' mb='24px'>
                    <FormControl display='flex' alignItems='center'>
                      <Checkbox
                        id='remember-login'
                        colorScheme='brandScheme'
                        me='10px'
                      />
                      <FormLabel
                        htmlFor='remember-login'
                        mb='0'
                        fontWeight='normal'
                        color={textColor}
                        fontSize='sm'>
                        Keep me logged in
                      </FormLabel>
                    </FormControl>
                    <NavLink to='/auth/forgot-password'>
                      <Text
                        color={textColorBrand}
                        fontSize='sm'
                        w='124px'
                        fontWeight='500'>
                        Forgot password?
                      </Text>
                    </NavLink>
                  </Flex> */}
                  <Button
                    fontSize='sm'
                    variant='brand'
                    fontWeight='500'
                    w='100%'
                    h='50'
                    mb='24px'
                    type="submit"
                    >
                    Sign In
                  </Button>
                  <FormErrorMessage>
                    Wrong username or password
                  </FormErrorMessage>
                </FormControl>
              )}

              </Field>
            </Form>
          )}
          </Formik>
          {/* <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='start'
            maxW='100%'
            mt='0px'>
            <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
              Not registered yet?
              <NavLink to='/auth/sign-up'>
                <Text
                  color={textColorBrand}
                  as='span'
                  ms='5px'
                  fontWeight='500'>
                  Create an Account
                </Text>
              </NavLink>
            </Text>
          </Flex> */}
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
