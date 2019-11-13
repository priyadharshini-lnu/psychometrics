;(function($) {

	$.noty.themes.defaultTheme = {
		name: 'defaultTheme',
		helpers: {
			borderFix: function() {
				if (this.options.dismissQueue) {
					var selector = this.options.layout.container.selector + ' ' + this.options.layout.parent.selector;
					switch (this.options.layout.name) {
						case 'top':
							$(selector).css({borderRadius: '0px 0px 0px 0px'});
							$(selector).last().css({borderRadius: '0px 0px 3px 3px'}); break;
						case 'topCenter': case 'topLeft': case 'topRight':
						case 'bottomCenter': case 'bottomLeft': case 'bottomRight':
						case 'center': case 'centerLeft': case 'centerRight': case 'inline':
							$(selector).css({borderRadius: '0px 0px 0px 0px'});
							$(selector).first().css({'border-top-left-radius': '3px', 'border-top-right-radius': '3px'});
							$(selector).last().css({'border-bottom-left-radius': '3px', 'border-bottom-right-radius': '3px'}); break;
						case 'bottom':
							$(selector).css({borderRadius: '0px 0px 0px 0px'});
							$(selector).first().css({borderRadius: '3px 3px 0px 0px'}); break;
						default: break;
					}
				}
			}
		},
		modal: {
			css: {
				position: 'fixed',
				width: '100%',
				height: '100%',
				backgroundColor: '#000',
				zIndex: 10000,
				opacity: 0.6,
				display: 'none',
				left: 0,
				top: 0
			}
		},
		style: function() {

			this.$bar.css({
				overflow: 'hidden',
				background: "#000000"
			});

			this.$message.css({
				fontSize: '11px',
				lineHeight: '14px',
				textAlign: 'center',
				padding: '8px 18px 9px',
				width: 'auto',
				position: 'relative'
			});

			this.$closeButton.addClass('fa fa-times')

			this.$closeButton.css({
				position: 'absolute',
				top: 4, right: 4,
				width: 10, height: 10,
				cursor: 'pointer',
			});

			this.$buttons.css({
				padding: 5,
				textAlign: 'right',
				borderTop: '0px',
				backgroundColor: '#333333'
			});

			this.$buttons.find('button').css({
				marginLeft: 5
			});

			this.$buttons.find('button:first').css({
				marginLeft: 0
			});

			switch (this.options.layout.name) {
				case 'top':
					this.$bar.css({
						borderRadius: '0px 0px 3px 3px',
						borderBottom: '2px solid #eee',
						borderLeft: '2px solid #eee',
						borderRight: '2px solid #eee',
						boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
					});
				break;
				case 'topCenter': case 'center': case 'bottomCenter': case 'inline':
					this.$bar.css({
						borderRadius: '3px',
						border: '1px solid #eee',
						boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
					});
					this.$message.css({fontSize: '11px', textAlign: 'center'});
				break;
				case 'topLeft': case 'topRight':
				case 'bottomLeft': case 'bottomRight':
				case 'centerLeft': case 'centerRight':
					this.$bar.css({
						borderRadius: '3px',
						border: '1px solid #eee',
						boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
					});
					this.$message.css({fontSize: '11px', textAlign: 'left'});
				break;
				case 'bottom':
					this.$bar.css({
						borderRadius: '3px 3px 0px 0px',
						borderTop: '2px solid #eee',
						borderLeft: '2px solid #eee',
						borderRight: '2px solid #eee',
						boxShadow: "0 -1px 2px rgba(0, 0, 0, 0.2)"
					});
				break;
				default:
					this.$bar.css({
						border: '2px solid #eee',
						boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
					});
				break;
			}

			switch (this.options.type) {
				case 'alert': case 'notification':
					this.$bar.css({backgroundColor: '#333', borderColor: '#333', color: '#FFF', opacity: 1}); break;
				case 'warning':
					this.$bar.css({backgroundColor: '#FEA223', borderColor: '#FEA223', color: '#FFF', opacity: 1});
					this.$buttons.css({borderTop: '1px solid #FEA223'}); break;
				case 'error':
					this.$bar.css({backgroundColor: '#B64645', borderColor: '#B64645', color: '#FFF', opacity: 1});
					this.$buttons.css({borderTop: '1px solid #B64645'}); break;
				case 'information':
					this.$bar.css({backgroundColor: '#3FBAE4', borderColor: '#3FBAE4', color: '#FFF', opacity: 1});
					this.$buttons.css({borderTop: '1px solid #3FBAE4'}); break;
				case 'success':
					this.$bar.css({backgroundColor: '#95B75D', borderColor: '#95B75D', color: '#FFF', opacity: 1});
					this.$buttons.css({borderTop: '1px solid #95B75D'});break;
				default:
					this.$bar.css({backgroundColor: '#333', borderColor: '#333', color: '#FFF', opacity: 1}); break;
			}
		},
		callback: {
			onShow: function() { $.noty.themes.defaultTheme.helpers.borderFix.apply(this); },
			onClose: function() { $.noty.themes.defaultTheme.helpers.borderFix.apply(this); }
		}
	};

})(jQuery);
