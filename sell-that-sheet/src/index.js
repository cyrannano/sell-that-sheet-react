import React from 'react';
import ReactDOM from 'react-dom';
import 'assets/css/App.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from 'layouts/auth';
import AdminLayout from 'layouts/admin';
import RtlLayout from 'layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import { ThemeEditorProvider } from '@hypertheme-editor/chakra-ui';
import { AuthProvider } from 'contexts/AuthContext';
import axios from 'axios';
import { useAuth } from 'contexts/AuthContext';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
setChonkyDefaults({ iconComponent: ChonkyIconFA });

const PrivateRoute = ({ component: Component, ...rest }) => {
	const { isAuthenticated } = useAuth();
	return (
	  <Route
		{...rest}
		render={(props) =>
		  isAuthenticated ? (
			<Component {...props} />
		  ) : (
			<Redirect to="/auth" />
		  )
		}
	  />
	);
  };
  

ReactDOM.render(
	<AuthProvider>
		<ChakraProvider theme={theme}>
			<React.StrictMode>
				<ThemeEditorProvider>
					<BrowserRouter>
						<Switch>
							<Route path={`/auth`} component={AuthLayout} />
							<PrivateRoute path={`/admin`} component={AdminLayout} />
							<PrivateRoute path={`/rtl`} component={RtlLayout} />
							<Redirect from='/' to='/auth' />
						</Switch>
					</BrowserRouter>
				</ThemeEditorProvider>
			</React.StrictMode>
		</ChakraProvider>
	</AuthProvider>,
	document.getElementById('root')
);
