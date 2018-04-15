///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as CONSTANTS from '../../config';
import loadIcon from '../../asset/img/loading-hor16.gif';
import RaisedButton from 'material-ui/RaisedButton';
import Helper from '../../helper';
import './style.scss';
///////////////////////////////////////////////////////////////////////////////
class Objects extends Component {
	//=========================================================================
	constructor(props) {
		super(props);		

		this.state = {
			// список объектов для вывода на текущей странице
			renderRecords: []
		};

		// возвращает максимальное количество страниц
		this.maxPage = () => Math.ceil(this.props.records.length / CONSTANTS.PAGE_SIZE);
	}

	//=========================================================================
	componentDidMount() {
		// грузим данные с учетом страницы
		this.loadData();
	}

	//=========================================================================
	nextPage() {
		// если родитель не задал данные - ничего не делаем,
		if (!this.props.records.length || !CONSTANTS.PAGE_SIZE) return;

		// если уже все страницы были загружены - ничего не делаем
		if (this.props.currentPage >= this.maxPage()) return;

		// запрет на скролл
		let x = window.scrollX;
		let y = window.scrollY;
		window.onscroll = () => window.scrollTo(x, y);

		// инкрементируем страницу - переменная в состоянии родителя
		this.props.savePage(this.props.currentPage + 1);
	}
	
	//=========================================================================
	loadData() {
		// грузим данные
		this.setState({ renderRecords: this.props.records.slice(0, this.props.currentPage * CONSTANTS.PAGE_SIZE) });
	}

	//=========================================================================
	componentDidUpdate(nextProps, nextState) {
		// если текущая страница поменялась (то есть увеличилась)
		if (nextProps.currentPage !== this.props.currentPage)
		{
			// подгрузим данные
			this.loadData();
		}
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
			if (!this.props.records || !this.props.records.length || !this.props.currentPage)
			{
				return (
					<div className="page-content">
						<div className="load-block">Объекты не обнаружены...</div>
					</div>
				);
			}
			
			return (
				<div className="page-content">
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
										<strong>Категория:</strong> { String(obj.estate_type).toLowerCase() }
										<br/>
										<strong>Комнат:</strong> { obj.room_quantity }
										<br/>
										<strong>Договорная стоимость:</strong> { Helper.formatPriceValue(obj) }
										<br/>
										<strong>Старт рекламы:</strong> { Helper.formatDate(obj.modified_date) }										
									</div>
								</span>
							</Link>
						)) }
					</div>

					{
						this.maxPage() > this.props.currentPage ?
						<RaisedButton className="load-more" label="Загрузить еще..." secondary={ true } onClick={ () => this.nextPage() } />
						: false
					}
				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Objects;
///////////////////////////////////////////////////////////////////////////////