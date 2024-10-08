import { GoslingSpec } from 'gosling.js';
import { View } from 'gosling.js/dist/src/gosling-schema';
import getMidView from './mid-spec';
import tracks from './track';
import { SampleType } from './data/samples';

export interface SpecOption extends SampleType {
    showOverview: boolean;
    xDomain?: [number, number];
    xOffset: number;
    width: number;
    breakpoints: [number, number, number, number];
    crossChr: boolean;
    bpIntervals: [number, number, number, number] | undefined;
    spacing: number;
}

function generateSpec(opt: SpecOption): GoslingSpec {
    const { assembly, width, spacing } = opt;

    const topViewWidth = Math.min(width, 600);;
    const midViewWidth = width;
    const bottomViewGap = 19;
    // console.log(getOverviewSpec({
    //     ...option,
    //     width: topViewWidth,
    //     xOffset: topViewXOffset
    // }));
    return {
        layout: 'linear',
        arrangement: 'vertical',
        centerRadius: 0.2,
        assembly,
        spacing,
        style: {
            outlineWidth: 1,
            outline: 'lightgray',
            enableSmoothPath: false
        },
        views: [
            {
                arrangement: 'horizontal',  // Horizontal arrangement of overview views
                views: [
                    ...getOverviewSpec({
                        ...opt,
                        width: topViewWidth,
                        xOffset: 0
                    }),
                    ...getOverviewLin({
                        ...opt,
                        width: topViewWidth - 40
                    })
                ]
            },
            ...getMidView({
                ...opt,
                width: midViewWidth
            })
        ]
    };
}

function getOverviewSpec(option: SpecOption): View[] {
    const { assembly, id, summary, roi, width, showOverview, xOffset } =
        option;

    if (!showOverview) return [];

    return [

        {
            xOffset,
            layout: 'circular',
            spacing: 1,
            style: {
                outlineWidth: 1,
                outline: 'lightgray'
            },
            tracks: [
                {
                    title: 'Ideogram',
                    id: `${id}-top-ideogram`,
                    alignment: 'overlay',
                    data: {
                        url:
                            assembly === 'hg38'
                                ? 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv'
                                : 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG19.Human.CytoBandIdeogram.csv',
                        type: 'csv',
                        chromosomeField: 'Chromosome',
                        genomicFields: ['chromStart', 'chromEnd']
                    },
                    tracks: [
                        { mark: 'rect' },
                        {
                            mark: 'brush',
                            x: { linkingId: 'mid-scale' },
                            strokeWidth: { value: 1 },
                            stroke: { value: '#0070DC' },
                            color: { value: '#AFD8FF' },
                            opacity: { value: 0.5 }
                        }
                    ],
                    color: {
                        field: 'Stain',
                        type: 'nominal',
                        domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                        range: ['white', 'lightgray', 'gray', 'gray', 'black', '#7B9CC8', '#DC4542']
                    },
                    size: { value: 18 },
                    x: { field: 'chromStart', type: 'genomic' },
                    xe: { field: 'chromEnd', type: 'genomic' },
                    strokeWidth: { value: 0 },
                    width,
                    height: 18
                },
                tracks.roi(`${id}-mid-ideogram`, roi, 'top'),
                ...(!summary
                    ? []
                    : [tracks.GQdetail(id, summary, width, 40, 'top'),
                    tracks.boundary('GQdetail', 'top'),
                    tracks.roi('GQdetail', roi, 'top'),
                    tracks.AFdetail(id, summary, width, 40, 'top'),
                    tracks.boundary('AFdetail', 'top'),
                    tracks.roi('AFdetail', roi, 'top'),
                    tracks.DPdetail(id, summary, width, 40, 'top'),
                    tracks.boundary('DPdetail', 'top'),
                    tracks.roi('DPdetail', roi, 'top'),
                    tracks.PLdetail(id, summary, width, 40, 'top'),
                    tracks.boundary('PLdetail', 'top'),
                    tracks.roi('PLdetail', roi, 'top')
                    ])
            ]
        }
    ];
}

function getOverviewLin(option: SpecOption): View[] {
    const { id, binStats, width, showOverview, xOffset } =
        option;

    if (!showOverview) return [];

    return [

        {
            xOffset,
            static: true,
            layout: 'linear',
            spacing: 5,
            style: {
                outlineWidth: 1,
                outline: 'lightgray'
            },
            tracks: [
                ...(!binStats
                    ? []
                    : [tracks.GQbin(id, binStats, width, 120, 'top'),
                    tracks.AFbin(id, binStats, width, 120, 'top'),
                    tracks.DPbin(id, binStats, width, 120, 'top'),
                        //tracks.PLbin(id, af, width, 120, 'top')
                    ]),
            ]
        }
    ];
}

export default generateSpec;
