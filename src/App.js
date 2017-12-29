///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import { Switch, Route,	withRouter } from 'react-router-dom';
///////////////////////////////////////////////////////////////////////////////
import axios from 'axios';
///////////////////////////////////////////////////////////////////////////////
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
///////////////////////////////////////////////////////////////////////////////
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
///////////////////////////////////////////////////////////////////////////////
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';
import Checkbox from 'material-ui/Checkbox';
///////////////////////////////////////////////////////////////////////////////
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
///////////////////////////////////////////////////////////////////////////////
import './App.css';
import loadIcon from './loading-hor16.gif';
///////////////////////////////////////////////////////////////////////////////
const CITY_ID = 'kyzyl';
const CITY_NAME = 'Кызыл';
const CITY_NAME_2 = 'Кызыла';
const PAGE_SIZE = 20;
const SALES = {
	'0': 'Продажа',
	'1': 'Аренда',
	'2': 'Покупка',
	'3': 'Съем в аренду'
};
///////////////////////////////////////////////////////////////////////////////
class Objects extends Component {
	//=========================================================================
	constructor(props) {
		super(props);
		this.state = {
			currentPage: 1,
			renderRecords: [],
			paginator: []
		};
	}

	//=========================================================================
	componentDidMount() {
		this.pagination();
	}

	//=========================================================================
	pagination() {
		this.setState({ renderRecords: [] });
		if (!this.props.records.length || !PAGE_SIZE) return;
		let count_pages = Math.ceil(this.props.records.length / PAGE_SIZE);

		if (count_pages <= 1)
		{
			let temp = this.props.records.slice();
			this.setState({ renderRecords: temp });
			return;
		}

		let curPage = this.state.currentPage;
		if (curPage <= 0) curPage = 1;
		if (curPage >= count_pages) curPage = count_pages;

		let first = curPage - 4;
		if (first <= 0) first = 1;
		let last = curPage + 4;
		if (last >= count_pages) last = count_pages;
		
		let pagination = [];
		if (first > 1)
			pagination.push(<span key={-1} onClick={() => this.goToPage(1)}>«</span>);

		for (let i = first; i < curPage; i++)
			pagination.push(<span key={i} onClick={() => this.goToPage(i)}>{i}</span>);

		pagination.push(<span className="current" key={curPage}>{curPage}</span>);

		for (let i = curPage + 1; i <= last; i++)
			pagination.push(<span key={i} onClick={() => this.goToPage(i)}>{i}</span>);

		if (last < count_pages)
			pagination.push(<span key={-2} onClick={() => this.goToPage(count_pages)}>»</span>);

		let begin = (curPage - 1) * PAGE_SIZE;
		let end = begin + PAGE_SIZE;
		let temp = this.props.records.slice(begin, end);
		this.setState({ renderRecords: temp });
		this.setState({ paginator: pagination });
	}

	//=========================================================================
	componentDidUpdate(nextProps, nextState) {
		if (nextState.currentPage !== this.state.currentPage)
			this.pagination();
	}

	//=========================================================================
	goToPage(page) {
		this.setState({ currentPage: page });
	}

	//=========================================================================
	render() {
		if (this.props.loading)
		{
			return (
				<div className="page-content">
					<h2>Недвижимость {CITY_NAME_2}</h2>

					<div className="load-block">
						<img src={loadIcon} alt="Загрузка данных..." />
					</div>
				</div>
			);
		}
		else
		{
			if (!this.props.records || !this.props.records.length)
			{
				return (
					<div className="page-content">
						<h2>Недвижимость {CITY_NAME_2}</h2>
						<div className="load-block">Объекты не обнаружены...</div>
					</div>
				);
			}

			return (
				<div className="page-content">
					<h2>Недвижимость {CITY_NAME_2}</h2>

					<div className="pagination">
						{this.state.paginator.map((item) => { return item; })}
					</div>

					<div className="objects-wrapper">
						{this.state.renderRecords.map((obj) => (
							<span className="object" key={obj.id}>
								<div className="object-header">{String(SALES[obj.sale]) + ' #' + obj.id}</div>
								<img src={'https://n1.realty/ivn/' + CITY_ID + '/img_thumb/t' + obj.item} alt={obj.id} />
								<div className="object-footer"><strong>Категория:</strong> {obj.estate_type}</div>
							</span>
						))}
					</div>
					
					{this.state.renderRecords.length > 10 ?
						<div className="pagination">
							{this.state.paginator.map((item) => { return item; })}
						</div>
						:
						false
					}

				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
class Agencies extends Component {
	//=========================================================================
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			records: []
		};
	}

	//=========================================================================
	componentDidMount() {
		axios.get('https://api.n1.realty/agencies/' + CITY_ID)
			.then(response => {
				this.setState({ records: response.data });
			})
			.catch(error => {
				this.setState({ records: [] });
			})
			.then(() => {
				this.setState({ loading: false });
			});
	}

	//=========================================================================
	render() {
		if (this.state.loading || !this.state.records.length)
		{
			return (
				<div className="page-content">
					<h2>Агентства представленные на портале</h2>

					<div className="load-block">
						<img src={loadIcon} alt="Загрузка данных..." />
					</div>
				</div>
			);
		}
		else
		{
			return (
				<div className="page-content">
					<h2>Агентства представленные на портале</h2>

					<Table>
						<TableHeader adjustForCheckbox={false} displaySelectAll={false}>
							<TableRow>
								<TableHeaderColumn>Наименование</TableHeaderColumn>
								<TableHeaderColumn>Сайт</TableHeaderColumn>
								<TableHeaderColumn>Телефон</TableHeaderColumn>
							</TableRow>
						</TableHeader>
						<TableBody displayRowCheckbox={false}>
						{this.state.records.map((record) => {
							return (
								<TableRow selectable={false} key={record.id}>
									<TableRowColumn>{record.name}</TableRowColumn>
									<TableRowColumn><a href={'http://' + record.url} target="_blank">{record.url}</a></TableRowColumn>
									<TableRowColumn>{record.phones}</TableRowColumn>
								</TableRow>
							);
						})}
						</TableBody>
					</Table>
				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
class Contact extends Component {
	//=========================================================================
	render() {
		return (
			<div className="page-content">
				<h2>Контакты</h2>
			</div>
		);
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
const NotFound = () => (
  <div className="page-content" style={{textAlign: 'center', 'paddingTop': '20%'}}>
	<h2>ОШИБКА 404:<br/>страница не найдена...</h2>    
  </div>
)
///////////////////////////////////////////////////////////////////////////////
class App extends Component {
	
	//=========================================================================
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			openLeftDrawer: false,
			openRightDrawer: false,

			records: [],

			filter: {
				sales: {}
			}
		};
		this.TITLE = 'N1.Realty - ' + CITY_NAME;
	}

	//=========================================================================
	componentDidMount() {
		axios.get('https://api.n1.realty/objects/' + CITY_ID)
			.then(response => {
				this.setState({ records: response.data });
			})
			.catch(error => {
				this.setState({ records: [] });
			})
			.then(() => {
				this.dataForFilter();
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
	menuItemClickHandler(path, history) {
		return () => {
			this.setState({ openLeftDrawer: false })
			history.push(path)
		}
	}

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

		return this.state.records;
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
		const { history } = this.props

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

						<MenuItem onClick={this.menuItemClickHandler('/', history)}>Объекты</MenuItem>
						<MenuItem onClick={this.menuItemClickHandler('/agencies', history)}>Агенства</MenuItem>
						<MenuItem onClick={this.menuItemClickHandler('/contact', history)}>Контакты</MenuItem>
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
									label={SALES['1']}
									checked={this.state.filter.sales['1'] === 'yes'}
									onCheck={this.salesFilter('1')}
								/>
							</div>
							: false
						}
						{this.state.filter.sales['0'] ?
							<div className="drawer-block">
								<Checkbox
									label={SALES['0']}
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
