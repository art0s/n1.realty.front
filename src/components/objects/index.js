///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as CONSTANTS from '../../config';
import loadIcon from '../../asset/img/loading-hor16.gif';
import Helper from '../../helper';
import './style.scss';
///////////////////////////////////////////////////////////////////////////////
class Objects extends Component {
	//=========================================================================
	constructor(props) {
		super(props);		

		// получим текущую страницу из URL
		let pageId = props.match.params.page === undefined ? 1 : parseInt(props.match.params.page, 10);
		if (isNaN(pageId) || pageId <= 0) pageId = false;
		if (pageId > Math.ceil(this.props.records.length / CONSTANTS.PAGE_SIZE)) pageId = false;

		this.state = {
			// текущая страница
			currentPage: pageId,
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
			pagination.push(<Link key={ -1 } to={'/'}>«</Link>);

		for (let i = first; i < curPage; i++)
			if (i === 1) pagination.push(<Link key={ 1 } to={'/'}>1</Link>);
			else pagination.push(<Link key={ i } to={`/${i}`}>{ i }</Link>);

		pagination.push(<span className="current" key={ curPage }>{ curPage }</span>);

		for (let i = curPage + 1; i <= last; i++)
			pagination.push(<Link key={ i } to={`/${i}`}>{ i }</Link>);

		if (last < count_pages)
			pagination.push(<Link key={ -2 } to={`/${count_pages}`}>»</Link>);

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
			if (!this.props.records || !this.props.records.length || !this.state.currentPage)
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
							<Link to={ `/view/${obj.dbname}/${obj.id}` } key={ obj.id }>
								<span className="object">
									<div className="image-wrapper">
										<img src={ 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_thumb/t' + obj.item } alt={ obj.id } />
									</div>
									<div className="object-footer">
										<strong>Тип сделки:</strong> { String(CONSTANTS.SALES[obj.sale]).toLowerCase() }
										<br/>
										<strong>Старт рекламы:</strong> { Helper.formatDate(obj.modified_date) }
										<br/>
										<strong>Категория:</strong> { String(obj.estate_type).toLowerCase() }
										<br/>
										<strong>Комнат:</strong> { obj.room_quantity }
										<br/>
										<strong>Стоимость:</strong> { Helper.formatPriceValue(obj) }
									</div>
								</span>
							</Link>
						)) }
					</div>

					{ this.state.renderRecords.length > 10 ? <div className="pagination down">{this.state.paginator.map((item) => { return item; })}</div> : false }
				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Objects;
///////////////////////////////////////////////////////////////////////////////