///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import { Switch, Route,	withRouter } from 'react-router-dom';
///////////////////////////////////////////////////////////////////////////////
import Contact from './components/contact';
import NotFound from './components/notfound';
import Agencies from './components/agencies';
import Objects from './components/objects';
///////////////////////////////////////////////////////////////////////////////
import axios from 'axios';
///////////////////////////////////////////////////////////////////////////////
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';
import Checkbox from 'material-ui/Checkbox';
///////////////////////////////////////////////////////////////////////////////
import * as CONSTANTS from './config';
import './App.css';
///////////////////////////////////////////////////////////////////////////////
class App extends Component {
	//=========================================================================
	constructor(props) {
		super(props);

		// состояние
		this.state = {
			// индикатор загрузки
			loading: true,
			// открытие/закрытие левой панели
			openLeftDrawer: false,
			// открытие/закрытие правой панели
			openRightDrawer: false,
			// список объектов
			records: [],
			// фильтр в состоянии
			filter: {
				sales: {}
			}
		};

		// заголовок
		this.TITLE = 'N1.Realty - ' + CONSTANTS.CITY_NAME;
	}

	//=========================================================================
	componentDidMount() {
		// запрос списка объектов
		axios.get(CONSTANTS.API_URL + '/objects/' + CONSTANTS.CITY_ID)
			.then(response => {
				// если пришли корректные данные
				if (response.data && Array.isArray(response.data))
					// запишем их в состояние, и ПОСЛЕ этого сделаем анализ для фильтра
					this.setState({ records: response.data }, this.dataForFilter);
			})
			.then(() => {
				this.setState({ loading: false });
			});
	}

	//=========================================================================
	dataForFilter() {
		let sales = {};
		this.state.records.forEach((item) => {
			if (!sales[item['sale']]) sales[item['sale']] = 'yes';
		});

		this.setState({ filter: { sales: sales }});
	}

	//=========================================================================
	menuItemClickHandler(path) {
		return () => {
			this.setState({ openLeftDrawer: false })
			this.props.history.push(path)
		}
	}

	//=========================================================================
	generateRecords() {
		if (this.state.filter.sales['0'] === 'no' || this.state.filter.sales['1'] === 'no')
		{
			let newRecs = this.state.records.filter((item) => {
				if (this.state.filter.sales['0'] === 'no' && item['sale'] === '0') return false;
				if (this.state.filter.sales['1'] === 'no' && item['sale'] === '1') return false;
				return true;
			})
			return newRecs;
		}

		return this.state.records.slice();
	}

	//=========================================================================
	salesFilter(what) {
		return (e) => {
			let sales = Object.assign({}, this.state.filter.sales);
			if (sales[what])
				sales[what] = sales[what] === 'yes' ? 'no' : 'yes';

			this.setState({ filter: { sales: sales }});
		}
	}

	//=========================================================================
	render() {
		return (
			<MuiThemeProvider>
			<div className="App">

					<AppBar
						className="appbar"
						title={this.TITLE}
						onLeftIconButtonClick={() => this.setState({ openLeftDrawer: true })}
						onRightIconButtonClick={() => this.setState({ openRightDrawer: true })}
						iconElementRight={<IconButton><ActionSearchIcon /></IconButton>}
					/>

					<Drawer
						docked={false}
						width={256}
						open={this.state.openLeftDrawer}
						onRequestChange={(open) => this.setState({ openLeftDrawer: open })}
						className="drawer-left"
					>
						<h2 className="drawer-header">N1.Realty</h2>
						<FloatingActionButton secondary={true} className="drawer-button" mini={true} onClick={() => this.setState({ openLeftDrawer: false })}><NavigationCloseIcon /></FloatingActionButton>

						<MenuItem onClick={this.menuItemClickHandler('/')}>Объекты</MenuItem>
						<MenuItem onClick={this.menuItemClickHandler('/agencies')}>Агенства</MenuItem>
						<MenuItem onClick={this.menuItemClickHandler('/contact')}>Контакты</MenuItem>
					</Drawer>

					<Drawer
						docked={false}
						width={256}
						openSecondary={true}
						open={this.state.openRightDrawer}
						onRequestChange={(open) => this.setState({ openRightDrawer: open })}
						className="drawer-right"
					>
						<h2 className="drawer-header">Фильтр</h2>
						<FloatingActionButton secondary={true} className="drawer-button" mini={true} onClick={() => this.setState({ openRightDrawer: false })}><NavigationCloseIcon /></FloatingActionButton>

						{this.state.filter.sales['1'] ?
							<div className="drawer-block">
								<Checkbox
									label={CONSTANTS.SALES['1']}
									checked={this.state.filter.sales['1'] === 'yes'}
									onCheck={this.salesFilter('1')}
								/>
							</div>
							: false
						}
						{this.state.filter.sales['0'] ?
							<div className="drawer-block">
								<Checkbox
									label={CONSTANTS.SALES['0']}
									checked={this.state.filter.sales['0'] === 'yes'}
									onCheck={this.salesFilter('0')}
								/>
							</div>
							: false
						}
						
					</Drawer>

					<Switch>
						<Route exact path="/" component={() => <Objects loading={this.state.loading} records={this.generateRecords()} />} />
						<Route exact path="/agencies" component={Agencies} />
						<Route exact path="/contact" component={Contact} />
						<Route component={NotFound} />
					</Switch>

			</div>
			</MuiThemeProvider>
		);
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default withRouter(App);
///////////////////////////////////////////////////////////////////////////////
