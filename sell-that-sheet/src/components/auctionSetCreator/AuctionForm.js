import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Spinner,
  Textarea,
} from '@chakra-ui/react';
import { createCategoryOfferObject } from 'contexts/AuthContext';
import AuctionList from 'components/auctionSetCreator/AuctionList';

// API function to fetch category parameters
const fetchCategoryParameters = async (categoryId) => {
  try {
    const response = await createCategoryOfferObject(categoryId);
    return response;
  } catch (error) {
    console.error('Failed to fetch category parameters', error);
    return [];
  }
};

// Chakra UI-compatible Formik Field
const ChakraField = ({ label, children, disabled, ...props }) => (
  <FormControl isInvalid={props.touched && props.error} mb={2}>
    <FormLabel size={disabled ? 'xs' : 'md'} margin={0} htmlFor={props.name}>{label}</FormLabel>
    {children}
    <FormErrorMessage>{props.error}</FormErrorMessage>
  </FormControl>
);

const AuctionForm = ({ categoryId, offerObject, auctions, setAuctions }) => {
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null); // State to track the selected auction for editing
  const [newAuctionData, setNewAuctionData] = useState(null);

  useEffect(() => {
    if (categoryId === null) {
      return;
    }
    const loadFormFields = async () => {
      if (offerObject) {
        setFormFields(offerObject);
        setNewAuctionData(offerObject);
        setLoading(false);
      } 
      // else {
      //   const parameters = await fetchCategoryParameters(categoryId);
      //   setFormFields(parameters);
      //   setLoading(false);
      // }
    };

    loadFormFields();
  }, [categoryId, offerObject]);

  // Build validation schema for form fields
  const buildValidationSchema = (fields) => {
    const schemaFields = {};
    fields.forEach((field) => {
      let validator = Yup.string();

      if (field.type === 'float') {
        validator = Yup.number().typeError('Must be a number');
        if (field.restrictions?.min !== undefined) {
          validator = validator.min(
            field.restrictions.min,
            `Minimum value is ${field.restrictions.min}`
          );
        }
        if (field.restrictions?.max !== undefined) {
          validator = validator.max(
            field.restrictions.max,
            `Maximum value is ${field.restrictions.max}`
          );
        }
      }

      if (field.type === 'string') {
        validator = Yup.string();
        if (field.restrictions?.minLength !== undefined) {
          validator = validator.min(
            field.restrictions.minLength,
            `Minimum length is ${field.restrictions.minLength}`
          );
        }
        if (field.restrictions?.maxLength !== undefined) {
          validator = validator.max(
            field.restrictions.maxLength,
            `Maximum length is ${field.restrictions.maxLength}`
          );
        }
      }

      if (field.required) {
        validator = validator.required(`Pole ${field.displayName || field.name} jest wymagane`);
      }

      schemaFields[field.name] = validator;
    });
    return Yup.object().shape(schemaFields);
  };

  // Get initial values from form fields
  const getInitialValues = (fields, selectedAuctionData, newAuctionData) => {
    return fields.reduce((values, field) => {
      if (selectedAuctionData) {
        values[field.name] =
          selectedAuctionData[field.id] ||
          selectedAuctionData.customParams[field.id] ||
          '';
      } else if (newAuctionData) {
        values[field.name] = newAuctionData.find((e) => e.id === field.id)?.value || '';
      } else {
          values[field.name] = '';
      }
      return values;
    }, {});
  };

  const validationSchema = buildValidationSchema(formFields);

  const handleFormSubmit = (values, actions) => {
    const auction = { customParams: {}, id: auctions.length + 1};

    formFields.forEach((field) => {
      if (field.base) {
        auction[field.id] = values[field.name];
      } else {
        auction.customParams[field.id] = values[field.name];
      }
    });

    if (selectedAuction !== null) {
      // Update existing auction
      const updatedAuctions = auctions.map((a, idx) =>
        idx === selectedAuction ? auction : a
      );
      setAuctions(updatedAuctions);
    } else {
      // Add new auction
      console.log('Adding new auction', auction);
      setAuctions([...auctions, auction]);
    }
    actions.setSubmitting(false);
    actions.resetForm();
    setSelectedAuction(null); // Reset after submission
    // scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to fill form with selected auction data
  const handleEditAuction = (auctionId) => {
    // find the index of the auction in the auctions array when given index of the auction in the category
    setSelectedAuction(auctions.findIndex((auction) => auction.id === auctionId));
  };

  const confirmAction = (action) => {
    return window.confirm(action);
  };

  const handleRemoveAuction = (auctionId) => {
    if (!confirmAction('Czy na pewno chcesz usunąć tę aukcję?')) {
      return;
    }
    const updatedAuctions = auctions.filter((auction, _) => auction.id !== auctionId);
    setAuctions(updatedAuctions);
    setSelectedAuction(null); // Reset after removal
  };

  const selectDefaultValue = (categoryId, fieldName) => {
    if (fieldName === 'Stan') return 'Używany';
    return '';
  };

  return (
    // create side by side form and list of auctions
    <Box display='grid' gridGap={2} gridAutoFlow={'column dense'} >
      <Box p={4}>
        {loading ? (
          <Spinner />
        ) : (
          <Formik
            initialValues={getInitialValues(formFields, auctions[selectedAuction], newAuctionData)}
            validationSchema={validationSchema}
            enableReinitialize={true} // Ensures form is updated when `initialValues` changes
            onSubmit={handleFormSubmit}
          >
            {({ isSubmitting }) => (
            <Form>
              {formFields.map((field) => (
                <Field key={field.id} name={field.name}>
                  {({ field: formikField, form: { errors, touched } }) => (
                    <ChakraField
                      label={field.displayName || field.name}
                      name={formikField.name}
                      touched={touched[formikField.name]}
                      error={errors[formikField.name]}
                      disabled={field.disabled}
                    >
                      {field.type === 'dictionary' &&
                      !field.restrictions?.multipleChoices ? (
                        <Select
                          {...formikField}
                          defaultValue={selectDefaultValue(categoryId, field.name)}
                        >
                          <option value=""></option>
                          {field.dictionary.map((option) => (
                            <option key={option.id} value={option.value}>
                              {option.value}
                            </option>
                          ))}
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          {...formikField}
                          disabled={field.disabled}
                          size={field.disabled ? 'xs' : 'md'}
                        />
                      ) : (
                        <Input
                          {...formikField}
                          disabled={field.disabled}
                          type={field.type === 'float' ? 'number' : 'text'}
                          size={field.disabled ? 'xs' : 'md'}
                          step={
                            field.type === 'float' && field.restrictions?.precision
                              ? Math.pow(10, -field.restrictions.precision)
                              : undefined
                          }
                        />
                      )}
                    </ChakraField>
                  )}
                </Field>
              ))}
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                >
                  {selectedAuction !== null ? 'Popraw Aukcję' : 'Dodaj Aukcję'}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Box>
      <Box p={4}>
        <AuctionList selectedAuction={auctions[selectedAuction]?.id} auctions={(categoryId === -1) ? auctions : auctions.filter(e => e.categoryBase == categoryId)} onEditAuction={handleEditAuction} onRemoveAuction={handleRemoveAuction}/> {/* Pass the edit handler */}
      </Box>

    </Box>

  );
};

export default AuctionForm;
