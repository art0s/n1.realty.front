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
import Helper from './helper';
///////////////////////////////////////////////////////////////////////////////
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
///////////////////////////////////////////////////////////////////////////////
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
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
			// отфильтрованный список объектов
			filteredRecords: [],
			// фильтр в состоянии
			filter: {
				sales: {
					list: {
						'0': CONSTANTS.SALES['0'],
						'1': CONSTANTS.SALES['1']
					},
					value: '0'
				},
				estates: {
					list: {},
					value: 'Квартира'
				},
				rooms: {
					list: {},
					value: []
				},
				price: {
					min: 999999999,
					minValue: 0,
					max: 0,
					maxValue: 0,
					withoutSum: true
				}
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
					this.setState({ records: response.data }, this.initFilter);
			})
			.then(() => {
				this.setState({ loading: false });
			});
	}

	//=========================================================================
	initFilter() {
		// первичная фильтрация: "продажа квартир"
		let _filter = Object.assign({}, this.state.filter);
		// соберем данные в фильтр
		this.state.records.forEach((item) => {
			// sales - уже все установлено
			// estates - значение установлено, нужно получить список
			if (item['sale'] === _filter.sales.value)
			{
				let _type = item['estate_type'] ? Helper.strCapitalize(item['estate_type']) : 'Неопределено';
				if (!(_type in _filter.estates.list)) _filter.estates.list[_type] = _type;

				// остальные значения
				if (_type === _filter.estates.value)
				{
					// нормализуем значение количества комнат
					let _room = this.getRoomValue(item['room_quantity']);
					// если еще нет в списке
					if (!(_room in _filter.rooms.list))
					{
						// добавим в список
						_filter.rooms.list[_room] = CONSTANTS.ROOMS[_room];
						// и в значение, так как по умолчанию все включено
						_filter.rooms.value.push(_room);
					}

					// значения для сумм
					let _sum = item['sale'] === '0' ? parseFloat(item['price']) : parseFloat(item['rent_price_month']);
					if (!isNaN(_sum))
					{
						if (_sum > _filter.price.max) _filter.price.max = _sum;
						if (_sum < _filter.price.min) _filter.price.min = _sum;
					}
				}
			}
		});

		// сортируем фильтры
		this.sortFilterLists(_filter);

		// получим отфильтрованные данные и новый фильтр
		let _recs = this.filterRecords(_filter, 'init');

		// меняем фильтр в состоянии
		this.setState({ filter: _filter, filteredRecords: _recs });
	}

	//=========================================================================
	menuItemClickHandler(path) {
		return () => {
			this.setState({ openLeftDrawer: false })
			this.props.history.push(path)
		}
	}

	//=========================================================================
	changeFilter(what, value) {
		// проверка
		if (!what || value === undefined || value === null) return;
		// получим текущий фильтр
		let _filter = Object.assign({}, this.state.filter);
		// если задано значение, которого нет в фильтре
		if (!_filter[what] || !('value' in _filter[what])) return;

		// установим значения фильтра (комнаты частный случай)		
		if (what === 'rooms')
		{
			let _room = this.getRoomValue(value.k);
			let _val = value.v;
			let _pos = _filter.rooms.value.indexOf(_room);
			if (_val === true)
			{
				// нужно добавить в список значений
				if (_pos === -1) _filter.rooms.value.push(_room);
			}
			else
			{
				// нужно удалить из списка значений
				if (_pos > -1) _filter.rooms.value.splice(_pos, 1);
			}
		}
		else _filter[what].value = value;
		// получим отфильтрованные данные и новый фильтр
		let _recs = this.filterRecords(_filter, what);

		// сортируем фильтры
		this.sortFilterLists(_filter);

		// меняем состояние
		this.setState({ filter: _filter, filteredRecords: _recs });
	}

	//=========================================================================
	filterRecords(filter, what) {
		// флаг для комнат
		let _newRooms = false;
		// обнуляем фильтры
		if (what === 'sales')
		{
			filter.estates.list = {};
			filter.estates.value = 'Квартира';

			filter.rooms.list = {};
			filter.rooms.value = [];
			_newRooms = true;

			filter.price.min = 999999999;
			filter.price.minValue = 0;
			filter.price.max = 0;
			filter.price.maxValue = 0;
			filter.price.withoutSum = true;
		}
		else if (what === 'estates')
		{
			filter.rooms.list = {};
			filter.rooms.value = [];
			_newRooms = true;

			filter.price.min = 999999999;
			filter.price.minValue = 0;
			filter.price.max = 0;
			filter.price.maxValue = 0;
			filter.price.withoutSum = true;
		}
		else if (what === 'rooms')
		{
			filter.price.min = 999999999;
			filter.price.minValue = 0;
			filter.price.max = 0;
			filter.price.maxValue = 0;
			filter.price.withoutSum = true;
		}

		// фильтруем данные согласно текущему фильтру
		let newRecs = this.state.records.filter((item) => {
			// идем сверху вниз по фильтру
			if (item['sale'] === filter.sales.value)
			{
				// заполняем список для фильтра "estates"
				let _type = item['estate_type'] ? Helper.strCapitalize(item['estate_type']) : 'Неопределено';
				if (!(_type in filter.estates.list)) filter.estates.list[_type] = _type;

				// остальные значения
				if (_type === filter.estates.value)
				{
					// нормализуем значение количества комнат
					let _room = this.getRoomValue(item['room_quantity']);
					// если еще нет в списке
					if (!(_room in filter.rooms.list)) filter.rooms.list[_room] = CONSTANTS.ROOMS[_room];

					// если значение обнулилось - выберем все значения
					if (_newRooms)
					{
						if (filter.rooms.value.indexOf(_room) === -1) filter.rooms.value.push(_room);

						// значения для сумм
						let _sum = item['sale'] === '0' ? parseFloat(item['price']) : parseFloat(item['rent_price_month']);
						if (!isNaN(_sum))
						{
							if (_sum > filter.price.max) filter.price.max = _sum;
							if (_sum < filter.price.min) filter.price.min = _sum;
						}

						// входит в фильтр
						return true;
					}
					// входит ли в фильтр
					else
					{
						if (filter.rooms.value.indexOf(_room) > -1)
						{
							// значения для сумм
							let _sum = item['sale'] === '0' ? parseFloat(item['price']) : parseFloat(item['rent_price_month']);
							if (!isNaN(_sum))
							{
								if (_sum > filter.price.max) filter.price.max = _sum;
								if (_sum < filter.price.min) filter.price.min = _sum;
							}

							// входит в фильтр
							return true;
						}
					}
				}
			}

			return false;
		});

		filter.price.minValue = filter.price.min;
		filter.price.maxValue = filter.price.max;
		
		return newRecs;
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
						<MenuItem onClick={this.menuItemClickHandler('/agencies')}>Агентства</MenuItem>
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

						{/* ===== тип сделки - аренда или продажа ===== */}
						{
							<div className="drawer-block">
								<RadioButtonGroup name="filterSale" valueSelected={ this.state.filter.sales.value } onChange={ (obj, val) => { this.changeFilter('sales', val) }}>
								{
									Object.keys(this.state.filter.sales.list).map(key => {
										return <RadioButton
											key={ key }
											value={ key }
											label={ this.state.filter.sales.list[key] }
										/>
									})
								}
								</RadioButtonGroup>
							</div>
						}

						{/* ===== тип объекта - квартира, дом и тд... ===== */}
						{
							this.state.filter.estates && this.state.filter.estates.list && Object.keys(this.state.filter.estates.list).length ?
							<div className="drawer-block">
								<RadioButtonGroup name="filterEstateType" valueSelected={ this.state.filter.estates.value } onChange={ (obj, val) => { this.changeFilter('estates', val) }}>
								{
									Object.keys(this.state.filter.estates.list).map(key => {
										return <RadioButton
											key={ key }
											value={ key }
											label={ this.state.filter.estates.list[key] }
										/>
									})
								}
								</RadioButtonGroup>
							</div>
							: false
						}

						{/* ===== количество комнат ===== */}
						{
							this.state.filter.rooms && this.state.filter.rooms.list && Object.keys(this.state.filter.rooms.list).length ?
							<div className="drawer-block">
								{
									Object.keys(this.state.filter.rooms.list).map(key => {
										return <Checkbox
											key={ key }
											label={ CONSTANTS.ROOMS[key] }
											checked={ this.state.filter.rooms.value.indexOf(key) > -1 }
											onCheck={ (obj, val) => this.changeFilter('rooms', { k: key, v: val }) }
										/>
									})
								}
							</div>
							: false
						}

						{/* ===== диапазон сумм ===== */}
						{
							<div className="drawer-block">
								<span className="cost-header">Стоимость:</span>
								<div style={{ padding: '0 6px' }}>
									<Range
										min={ this.state.filter.price.min }
										max={ this.state.filter.price.max }
										value={ [this.state.filter.price.minValue, this.state.filter.price.maxValue] }
									/>
									<span className="cost-header" style={{ textAlign: 'center', fontWeight: 'bold', color: '#000 !important' }}>
										от { this.state.filter.price.minValue } до { this.state.filter.price.maxValue }
									</span>
								</div>								
								<Checkbox
									className="without-sum"
									key="withoutSum"
									label="Показывать объекты без стоимости"
									checked={ this.state.filter.price.withoutSum }
									onCheck={ (obj, val) => this.changeFilter('sum', { k: 'check', v: val }) }
								/>
							</div>
						}
						
					</Drawer>

					<Switch>
						<Route exact path="/" component={() => <Objects loading={this.state.loading} records={ this.state.filteredRecords } />} />
						<Route exact path="/agencies" component={ Agencies } />
						<Route exact path="/contact" component={ Contact } />
						<Route component={ NotFound } />
					</Switch>

			</div>
			</MuiThemeProvider>
		);
	}

	//=========================================================================
	getRoomValue(value) {
		// нормализуем значение количества комнат
		let _room = value ? String(value) : '?';
		let _roomValue = parseInt(_room, 10);
		if (isNaN(_roomValue) || _roomValue <= 0) _room = '?';
		if (_roomValue >= 5) _room = '5';
		return _room;
	}

	//=========================================================================
	sortFilterLists(filter) {
		// сортировка фильтра по типу жилья
		let list = {};
		for (let k in CONSTANTS.ESTATES) if (CONSTANTS.ESTATES.hasOwnProperty(k))
		{
			if (k in filter.estates.list) list[k] = filter.estates.list[k];
		}
		filter.estates.list = Object.assign({}, list);

		// сортировка фильтра по комнатам
		list = {};
		for (let k in CONSTANTS.ROOMS) if (CONSTANTS.ROOMS.hasOwnProperty(k))
		{
			if (k in filter.rooms.list) list[k] = filter.rooms.list[k];
		}
		filter.rooms.list = Object.assign({}, list);
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default withRouter(App);
///////////////////////////////////////////////////////////////////////////////
