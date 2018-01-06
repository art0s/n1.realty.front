///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import * as CONSTANTS from '../../config';
import loadIcon from '../../asset/img/loading-hor16.gif';
import './style.scss';
///////////////////////////////////////////////////////////////////////////////
class Objects extends Component {
	//=========================================================================
	constructor(props) {
		super(props);
		this.state = {
			// текущая страница
			currentPage: 1,
			// список объектов для вывода на текущей странице
			renderRecords: [],
			// пагинатор - список кнопок
			paginator: []
		};
	}

	//=========================================================================
	componentDidMount() {
		this.pagination();
	}

	//=========================================================================
	pagination() {
		// если не заданы данные
		if (!this.props.records.length || !CONSTANTS.PAGE_SIZE) return;

		// вычисляем количество страниц
		let count_pages = Math.ceil(this.props.records.length / CONSTANTS.PAGE_SIZE);
		// если страница всего одна
		if (count_pages <= 1)
		{
			let temp = this.props.records.slice();
			this.setState({ paginator: [], renderRecords: temp });
			return;
		}

		// форматируем данные
		let curPage = this.state.currentPage;
		if (curPage <= 0) curPage = 1;
		if (curPage >= count_pages) curPage = count_pages;

		let first = curPage - 4;
		if (first <= 0) first = 1;
		let last = curPage + 4;
		if (last >= count_pages) last = count_pages;

		// начинаем генерацию пагинатора
		let pagination = [];
		if (first > 1)
			pagination.push(<span key={ -1 } onClick={ () => this.goToPage(1) }>«</span>);

		for (let i = first; i < curPage; i++)
			pagination.push(<span key={ i } onClick={ () => this.goToPage(i) }>{ i }</span>);

		pagination.push(<span className="current" key={ curPage }>{ curPage }</span>);

		for (let i = curPage + 1; i <= last; i++)
			pagination.push(<span key={ i } onClick={ () => this.goToPage(i) }>{ i }</span>);

		if (last < count_pages)
			pagination.push(<span key={ -2 } onClick={ () => this.goToPage(count_pages) }>»</span>);

		// вырезаем нужные записи
		let begin = (curPage - 1) * CONSTANTS.PAGE_SIZE;
		let end = begin + CONSTANTS.PAGE_SIZE;
		let temp = this.props.records.slice(begin, end);

		// изменяем состояние
		this.setState({ paginator: pagination, renderRecords: temp });
	}

	//=========================================================================
	componentDidUpdate(nextProps, nextState) {
		// если текущая страница поменялась
		if (nextState.currentPage !== this.state.currentPage)
			// перегенерируем пагинатор
			this.pagination();
	}

	//=========================================================================
	goToPage(page) {
		this.setState({ currentPage: page });
	}

	//=========================================================================
	formatRoomValue(value) {
		// нормализуем значение количества комнат
		let _room = value ? String(value) : '?';
		let _roomValue = parseInt(_room, 10);
		if (isNaN(_roomValue) || _roomValue <= 0) _room = '?';
		if (_roomValue >= 4) _room = '4+';
		return _room;
	}

	//=========================================================================
	formatPriceValue(obj) {
		// нормализуем значение стоимости объекта
		if (!obj || !obj.sale) return 'без стоимости';

		let _price = false;
		let _ed = 'руб.';
		// если это продажа
		if (String(obj.sale) === '0')
		{
			_price = parseFloat(obj.price);
			_ed = 'тыс. руб.';
		}
		// если это аренда
		else if (String(obj.sale) === '1')
		{
			_price = parseFloat(obj.rent_price_month);
		}

		if (isNaN(_price)) return 'без стоимости';

		return _price.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + _ed;
	}

	//=========================================================================
	render() {
		if (this.props.loading)
		{
			return (
				<div className="page-content">
					<div className="load-block">
						<img src={ loadIcon } alt="Загрузка данных..." />
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
						<div className="load-block">Объекты не обнаружены...</div>
					</div>
				);
			}

			return (
				<div className="page-content">
					<div className="pagination up">{ this.state.paginator.map((item) => { return item }) }</div>

					<div className="objects-wrapper">
						{ this.state.renderRecords.map((obj) => (
							<span className="object" key={ obj.id }>
								<div className="object-header">{ String(CONSTANTS.SALES[obj.sale]) + ' - ' + this.formatDate(obj.modified_date) }</div>
								<img src={ 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_thumb/t' + obj.item } alt={ obj.id } />
								<div className="object-footer">
									<strong>Категория:</strong> { String(obj.estate_type).toLowerCase() }
									<br/>
									<strong>Комнат:</strong> { this.formatRoomValue(obj.room_quantity) }
									<br/>
									<strong>Стоимость:</strong> { this.formatPriceValue(obj) }
								</div>
							</span>
						)) }
					</div>

					{ this.state.renderRecords.length > 10 ? <div className="pagination down">{this.state.paginator.map((item) => { return item; })}</div> : false }
				</div>
			);
		}
	}

	//=========================================================================
	formatDate(date) {
		if (!date) return '';
		date = String(date);
		if (!/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(date)) return date;

		return date.substr(8, 2) + '.' + date.substr(5, 2) + '.' + date.substr(0, 4);
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Objects;
///////////////////////////////////////////////////////////////////////////////