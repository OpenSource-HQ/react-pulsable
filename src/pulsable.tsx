import { ReactNode, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import './css/index.scss';
import { iPlaceholder } from './image-placeholder';

interface bgColors {
  medium: string;
  light: string;
}

type pulseAnimation = 'none' | 'pulse' | 'wave' | 'wave-reverse';

export interface Props {
  animation?: pulseAnimation;
  children: ReactNode;
  isLoading: boolean;
  bgColors?: bgColors;
  noRadius?: boolean;
  noPadding?: boolean;
  className?: string;
  [key: string]: any;
}

const pulseClassNames: {
  [key: string]: string;
} = {
  pulse: 'pulse-animate',
  wave: 'pulse-animate-wave',
  'wave-reverse': 'pulse-animate-wave-reverse',
  none: 'pulse-animate-none',
};

function countLines(target: Element) {
  var style = window.getComputedStyle(target, null);
  var height = parseInt(style.getPropertyValue('height'), 10);
  var font_size = parseInt(style.getPropertyValue('font-size'), 10);
  var line_height = parseInt(style.getPropertyValue('line-height'), 10);
  var box_sizing = style.getPropertyValue('box-sizing');

  if (Number.isNaN(line_height)) line_height = font_size * 1.2;

  if (box_sizing === 'border-box') {
    var padding_top = parseInt(style.getPropertyValue('padding-top'), 10);
    var padding_bottom = parseInt(style.getPropertyValue('padding-bottom'), 10);
    var border_top = parseInt(style.getPropertyValue('border-top-width'), 10);
    var border_bottom = parseInt(
      style.getPropertyValue('border-bottom-width'),
      10
    );
    height = height - padding_top - padding_bottom - border_top - border_bottom;
  }

  var lines = Math.ceil(height / line_height);
  return { lines, font_size, height };
}

const Pulsable = ({
  animation = 'wave',
  children,
  isLoading,
  bgColors,
  noRadius = false,
  noPadding = false,
  className,
  ...props
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isCalculating, setCalculating] = useState(true);

  const getComps = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    const el = document.createElement('div');

    const pulseParaCont = el.cloneNode(true) as HTMLDivElement;
    pulseParaCont.classList.add(
      'pulse-child-para-cont',
      'pulse-no-rounded',
      'pulse-child'
    );

    el.style.setProperty(
      '--color-transparent-medium',
      bgColors?.medium || 'rgba(130, 130, 130, 0.3)'
    );

    el.style.setProperty(
      '--color-transparent-light',
      bgColors?.light || 'rgba(130, 130, 130, 0.2)'
    );
    el.classList.add(pulseClassNames[animation]);

    const pPara = el.cloneNode(true) as HTMLDivElement;
    pPara.classList.add('pulse-child-para');

    el.classList.add('pulse-child');
    const pCircle = el.cloneNode(true) as HTMLDivElement;
    pCircle.classList.add('pulse-child-circle');

    if (noRadius) {
      el.classList.add('pulse-no-rounded');
      pPara.classList.add('pulse-no-rounded');
    }

    const pHidden = el.cloneNode(true) as HTMLDivElement;
    pHidden.classList.add('pulse-child-hidden');

    const pRect = el.cloneNode(true) as HTMLDivElement;
    pRect.classList.add('pulse-child-rect');

    const pRectFull = el.cloneNode(true) as HTMLDivElement;
    pRectFull.classList.add('pulse-child-rect-full');

    return {
      pCircle: () => pCircle.cloneNode(true) as HTMLDivElement,
      pPara: () => pPara.cloneNode(true) as HTMLDivElement,
      pHidden: () => pHidden.cloneNode(true) as HTMLDivElement,
      pRect: () => pRect.cloneNode(true) as HTMLDivElement,
      pRectFull: () => pRectFull.cloneNode(true) as HTMLDivElement,
      pParaCont: () => pulseParaCont.cloneNode(true) as HTMLDivElement,
    };
  };
  const [components, setComponents] = useState(getComps);

  useEffect(() => {
    const manp = () => {
      if (isLoading) {
        setCalculating(true);
        if (!ref.current) {
          setCalculating(false);
          return;
        }

        if (!components) {
          setComponents(getComps());
        }
        if (!components) {
          setCalculating(false);
          return;
        }

        const iSvg = document.createElement('div');
        iSvg.classList.add('pulse-svg-cont');
        iSvg.innerHTML = iPlaceholder;

        ref.current.querySelectorAll('.pulsable').forEach((element) => {
          element.classList.add('pulse-element');

          if (!element.hasAttribute('disabled')) {
            element.classList.add('pulse-has-disabled-attr');
            element.setAttribute('disabled', 'true');
          }

          element.childNodes.forEach((ch: any) => {
            if (ch.classList && !ch.classList.contains('pulse-child')) {
              ch.classList.add('pulse-child-element');

              if (!ch?.hasAttribute('disabled')) {
                ch.classList.add('pulse-has-disabled-attr');
                ch.setAttribute('disabled', 'true');
              }
            }
          });

          const pc = element.querySelector('.pulse-child');
          if (!pc) {
            var pulseEl;
            const cList = element.classList;

            if (cList.contains('pulsable-circle')) {
              pulseEl = components.pCircle();
            } else if (cList.contains('pulsable-hidden')) {
              pulseEl = components.pHidden();
            } else if (cList.contains('pulsable-para')) {
              pulseEl = components.pParaCont();

              const res = countLines(element);

              const gap =
                (res.height - res.font_size * res.lines) / (res.lines + 2);

              const gapString = `${Math.max(gap, 8)}px`;

              pulseEl.style.setProperty('padding-top', gapString);
              pulseEl.style.setProperty('padding-bottom', gapString);

              const pulsePara = components.pPara();

              pulsePara.style.setProperty(
                'height',
                `${(res.font_size * 80) / 100}px`
              );

              for (let i = 0; i < res.lines; i++) {
                pulseEl.appendChild(pulsePara.cloneNode(true));
              }
            } else if (noPadding) {
              pulseEl = components.pRectFull();
            } else {
              pulseEl = components.pRect();
            }

            if (cList.contains('pulsable-img')) {
              pulseEl.appendChild(iSvg);
            }

            element.parentNode?.appendChild(pulseEl);
            element.appendChild(pulseEl);
          }
        });

        setCalculating(false);
      } else {
        if (!ref.current) {
          return;
        }

        ref.current.querySelectorAll('.pulse-child').forEach((v) => {
          v.parentNode?.removeChild(v);
        });

        ref.current.querySelectorAll('.pulse-element').forEach((v) => {
          if (v.classList) {
            v.classList.remove('pulse-element');
          }
        });

        ref.current
          .querySelectorAll('.pulse-has-disabled-attr')
          .forEach((element) => {
            element.removeAttribute('disabled');
            element.classList.remove('pulse-has-disabled-attr');
          });

        ref.current
          .querySelectorAll('.pulse-child-element')
          .forEach((element) => {
            element.classList.remove('pulse-child-element');
          });
      }
    };

    requestAnimationFrame(manp);
  }, [isLoading, ref.current]);

  return (
    <div
      ref={ref}
      className={cn(
        'pulse-container',
        {
          'pulse-calculating pulse-container-css': isLoading && isCalculating,
          'pulse-container-css': isLoading,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Pulsable;
