///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { YMaps, Map } from 'react-yandex-maps';
import * as CONSTANTS from '../../config';
import loadIcon from '../../asset/img/loading-hor16.gif';
import RaisedButton from 'material-ui/RaisedButton';
import Helper from '../../helper';
import './style.css';

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

		// обработчик кликов для всего документа
		this.clickEvent = e => {
			// если кликнули по ссылке в балуне
			if (e.target.tagName === 'SPAN' && e.target.className === 'balloon-link' &&
				e.target.dataset && e.target.dataset.path)
			{
				this.props.history.push(e.target.dataset.path)
				return false;
			}
		}
	}

	//=========================================================================
	componentDidMount() {
		// обработчик кликов
		document.addEventListener('click', this.clickEvent);
		// грузим данные с учетом страницы
		this.loadData();
	}

	//=========================================================================
	componentWillUnmount() {
		// уберем обработчик
		document.removeEventListener('click', this.clickEvent);
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

		this.Ymaps = null;
	}
	
	//=========================================================================
	loadData() {
		// грузим данные
		if (this.props.viewMode === 'table')
			this.setState({ renderRecords: this.props.records.slice(0, this.props.currentPage * CONSTANTS.PAGE_SIZE) });
		else
			this.setState({ renderRecords: this.props.records });
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
	initYmaps(ymaps) {
		// запишем инстанс яндекс карт
		if (!ymaps) return;
		// только когда он будет инициализирован
		this.Ymaps = ymaps;
	}

	//=========================================================================
	createClusterer(map) {
		// добавляем свой кластерер
		if (!map || !this.Ymaps) return;

		// свой макет балуна
		let customBalloonContentLayout = this.Ymaps.templateLayoutFactory.createClass([
			'<h3>{{ properties.geoObjects[0].properties.balloonContentHeader|raw }}</h3>',
			'{% for geoObject in properties.geoObjects %}',
			'<div class="clusterer-balloon">{{ geoObject.properties.balloonContentBody | raw }}</div>',
			'{% endfor %}',
		].join(''));

		// кластеризатор - группирует метки
		let clusterer = new this.Ymaps.Clusterer({
			preset: 'islands#invertedVioletClusterIcons',
			clusterOpenBalloonOnClick: true,
			clusterBalloonContentLayout: customBalloonContentLayout
		});

		// метки
		let placemarks = [];
		this.state.renderRecords.forEach((item, idx) => {
			if (item.latitude && item.longitude)
			{
				let placemark = new this.Ymaps.Placemark(
					[
						parseFloat(item.latitude),
						parseFloat(item.longitude)
					],
					{
						balloonContentHeader: CONSTANTS.CITY_NAME + ', ' + Helper.formatAdresValue(item),
						balloonContentBody: Helper.balloonInfo(item),
						placemarkId: idx
					},
					{
						preset: 'islands#violetCircleDotIcon'
					}
				);
				placemarks.push(placemark);
			}
		});

		// собираем все на карте
		clusterer.add(placemarks);
		map.geoObjects.add(clusterer);
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
			
			// вид - таблица
			if (this.props.viewMode === 'table')
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
											<div className="mobile-only">
												<strong>Сделка:</strong> { String(CONSTANTS.SALES[obj.sale]).toLowerCase() }
												<br/>
												<strong>Объект:</strong> { String(obj.estate_type).toLowerCase() }
												<br/>
											</div>
											<strong>Комнат:</strong> { obj.room_quantity }
											{
												obj.total_floor_space
												? (<span><br/><strong>Площадь:</strong> { Helper.formatSquareValue(obj) }</span>)
												: false
											}
											<br/>
											<strong>Стоимость:</strong> { Helper.formatPriceValue(obj) }
											{
												obj.street
												? (<span><br/><strong>Адрес:</strong> { Helper.formatAdresValue(obj) }</span>)
												: false
											}
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
			// вид - карта
			else
			{
				return (
					<div className="page-content yandex-map-container">
						<YMaps onApiAvaliable={ ymaps => this.initYmaps(ymaps) } >
							<Map
								options={ CONSTANTS.YandexMAP[CONSTANTS.CITY_ID].options }
								state={ CONSTANTS.YandexMAP[CONSTANTS.CITY_ID].state }
								width={ '100%' }
								height={ '100%' }
								instanceRef={ map => this.createClusterer(map) }
							/>
						</YMaps>
					</div>
				);
			}
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Objects;
///////////////////////////////////////////////////////////////////////////////