#!/usr/bin/perl

use strict;
use warnings;
use FindBin qw/$Bin/;
use lib "$Bin/lib";
use XML::Writer;
use IO::File;
use Term::ANSIColor;

use BS qw/all_languages/;

my @langs = map { lc $_ } all_languages();
my @urls = (
    # path (without .html) , changefreq, priority, exclude languages
    ['home',                 'monthly', '1.00'],
    ['metatrader',           'monthly', '0.80'],
    ['metatrader/download',  'monthly', '0.80'],
);


my $root_path = substr $Bin, 0, rindex($Bin, '/');
my $output = IO::File->new(">$root_path/sitemap.xml");

my $writer = XML::Writer->new(OUTPUT => $output, DATA_INDENT => 4, DATA_MODE => 1);
$writer->xmlDecl('UTF-8');

$writer->startTag('urlset',
    'xmlns'              => 'http://www.sitemaps.org/schemas/sitemap/0.9',
    'xmlns:xsi'          => 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation' => 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd');

my $url_prefix = 'https://mt5.binary.com/';
my $excluded = 0;

foreach my $lang (@langs) {
    foreach my $url (@urls) {
        if ($url->[3] and index($url->[3], $lang) > -1) {
            $excluded++;
            next;
        }

        $writer->startTag('url');

        $writer->dataElement('loc'       , $url_prefix.$lang.'/'.$url->[0].'.html');
        $writer->dataElement('changefreq', $url->[1]);
        $writer->dataElement('priority'  , $url->[2]);

        $writer->endTag('url');
    }
}

$writer->endTag('urlset');

$writer->end();
$output->close();

print $root_path.'/'.colored(['green'], 'sitemap.xml')." successfully created.\n"
        .colored(['green'], scalar @langs).' Languages, '
        .colored(['green'], scalar @urls).' URLs ==> '
        .colored(['green'], (@langs * @urls - $excluded)).' url nodes total'
        .($excluded ? " (-$excluded urls excluded)" : '')."\n";

1;
